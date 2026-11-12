# © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.
"""
Offline Cycles renders of the Aetheria flacon. Nothing here ships: no GLB, no WebGL. The page shows
the AVIFs that blender/encode.mjs makes from these 16-bit PNGs.

One job per Blender run, through the studio toolkit's single Blender slot:
    node TOOLS/blender.mjs blender/render.py -- --job poster --out blender/out
Options after "--":
    --job     poster | set | glass | liquid-low | liquid-mid | liquid-high | glint | leaflight | preview | batch
    --jobs    (batch) comma-separated final jobs to render in one session, e.g. set,glass,liquid-mid
    --out     output folder (default: blender/out next to this file)
    --spp N   override the job's sample count
    --size WxH  override the job's resolution (the 5:7 framing is solved for any 5:7 size)
    --pitch D camera pitch in degrees (default PITCH below)
"preview" renders every job small (240x336 at 16 spp; leaflight 320x200) in one session, for checking
framing and lighting before spending the slot on the real samples.

The scene (shared by every flacon job, so all layers register pixel for pixel):
- flacon.obj from export-flacon.mts: crystal vessel and finial, ground-glass shank, brass collar, seat
  and cap, the liquid bisected at the job's fill level, and "HVNF" etched in frosted glass on the foot;
- a parchment set (floor, a soft cove, a back wall at y = +1.8);
- a leaf gobo ported from the old komorebi backdrop (mulberry32 seeds 19/7/43): shadow-only leaves
  between a warm "dapple" area light and the set;
- a spot key ("window sun") that only the flacon may shadow (shadow linking), so leaves never block it,
  with MNEE shadow caustics onto the floor; an area fill and a rim;
- one 85 mm camera solved so the stopper top sits at 24% of the frame, the base contact at 84%.
"""
import bpy
import bmesh
import json
import math
import os
import sys
import time

import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
T0 = time.time()

# ------------------------------------------------------------------------------------------- args
ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default=None):
    if name in ARGV:
        i = ARGV.index(name)
        if i + 1 < len(ARGV):
            return ARGV[i + 1]
    return default


JOB = arg("--job", "preview")
OUT = os.path.abspath(arg("--out", os.path.join(HERE, "out")))
SPP_OVERRIDE = arg("--spp")
SIZE_OVERRIDE = arg("--size")
# 2 degrees: nearly level with the liquid, so the meniscus seen through the flutes stays a gentle wave
# instead of the tall crown it made at 6 degrees.
PITCH = math.radians(float(arg("--pitch", "2")))
os.makedirs(OUT, exist_ok=True)

# Fill levels (0..1 of the liquid range), cut at z = liquidMinY + level * (liquidMaxY - liquidMinY).
LEVELS = {"poster": 0.62, "liquid-low": 0.43, "liquid-mid": 0.62, "liquid-high": 0.75}

JOBS = {
    #  name           resolution    spp  output stem
    "poster": ((960, 1344), 384, "poster"),
    "set": ((600, 840), 128, "compose-set"),
    "glass": ((600, 840), 192, "compose-glass"),
    "liquid-low": ((600, 840), 128, "compose-liquid-low"),
    "liquid-mid": ((600, 840), 128, "compose-liquid-mid"),
    "liquid-high": ((600, 840), 128, "compose-liquid-high"),
    "glint": ((960, 1344), 64, "glint"),
    "leaflight": ((1600, 1000), 96, "leaflight"),
}

FLACON_PARTS = ("vessel", "liquid", "collar", "stopper_shank", "stopper_seat", "stopper_finial", "stopper_cap")
STOPPER_PARTS = ("stopper_shank", "stopper_seat", "stopper_finial", "stopper_cap")

# Framing targets (fractions of the frame, measured from the top / of the width).
FRAME_TOP, FRAME_BOTTOM = 0.24, 0.84


def log(*parts):
    print(f"[render {time.time() - T0:6.1f}s]", *parts, flush=True)


# ---------------------------------------------------------------------------------------- colour
def srgb_to_linear(hex_colour):
    h = hex_colour.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


# The book's stock (src/lib/palette.ts; Python can't import it, so keep these in step by hand).
# The set is the lighter kraft sheet the niche is cut from, the leaf light falls on the page's own
# kraft, and the world is a warm bistre bounce, so the glass refracts and the caustic lands on toned
# paper while its highlights stay white: gouache on kraft, the way old botanical studies were heightened.
PARCHMENT = srgb_to_linear("#DBC5A0")
LINEN = srgb_to_linear("#C7A982")
# Real brass stays brass: the page's darker --color-brass (#7B5A26) is an ink for hairlines on kraft,
# not a metal albedo.
BRASS = srgb_to_linear("#A88243")
WORLD = srgb_to_linear("#E8D9BE")
# Amber lives in the volume, so thick parts read deeper than the edges. Through the centre (about one
# unit of liquid) this transmits roughly (.68, .27, .02) of the light behind it: after AgX and the
# encoder's white balance that is #B8862E. Density 1.4 cannot get there (blue would still pass 25%).
AMBER_TINT = (1.0, 1.0, 1.0)
AMBER_ABSORB = (0.90, 0.675, 0.02)
AMBER_DENSITY = 4.0
# Exposure for the flacon jobs. The set lands near scene-linear 0.45, below AgX's shoulder, so the amber
# keeps its saturation; encode.mjs then lifts the set's top band to parchment with a linear gain.
EXPOSURE = -1.3


# ------------------------------------------------------------------------------------- materials
def new_material(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    return m


def principled(name, **inputs):
    m = new_material(name)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    for key, value in inputs.items():
        if isinstance(value, tuple) and len(value) == 3:
            value = (*value, 1.0)
        bsdf.inputs[key].default_value = value
    return m


def single_bsdf(name, node_type, **inputs):
    """A material made of one shader node (Refraction BSDF, Diffuse, Emission...)."""
    m = new_material(name)
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    node = nt.nodes.new(node_type)
    for key, value in inputs.items():
        if isinstance(value, tuple) and len(value) == 3:
            value = (*value, 1.0)
        node.inputs[key].default_value = value
    nt.links.new(node.outputs[0], out.inputs["Surface"])
    return m


def make_materials():
    mats = {}
    mats["crystal"] = principled("crystal", **{"Base Color": (1.0, 1.0, 1.0), "Roughness": 0.0, "IOR": 1.52, "Transmission Weight": 1.0})
    mats["ground"] = principled("ground glass", **{"Base Color": (1.0, 1.0, 1.0), "Roughness": 0.35, "IOR": 1.52, "Transmission Weight": 1.0})
    liquid = principled("amber", **{"Base Color": AMBER_TINT, "Roughness": 0.0, "IOR": 1.36, "Transmission Weight": 1.0})
    nt = liquid.node_tree
    vol = nt.nodes.new("ShaderNodeVolumeAbsorption")
    vol.inputs["Color"].default_value = (*AMBER_ABSORB, 1.0)
    vol.inputs["Density"].default_value = AMBER_DENSITY
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    mats["amber"] = liquid
    mats["brass"] = principled("brass", **{"Base Color": BRASS, "Metallic": 1.0, "Roughness": 0.28})
    mats["set"] = principled("parchment set", **{"Base Color": PARCHMENT, "Roughness": 0.9})
    mats["linen"] = principled("linen", **{"Base Color": LINEN, "Roughness": 0.9})
    mats["etch"] = principled("frosted etch", **{"Base Color": (1.0, 1.0, 1.0), "Roughness": 0.6, "IOR": 1.52, "Transmission Weight": 1.0})
    # Pass materials.
    mats["white"] = principled("white diffuse", **{"Base Color": (1.0, 1.0, 1.0), "Roughness": 0.5})
    mats["refraction"] = single_bsdf("refraction only", "ShaderNodeBsdfRefraction", **{"Color": (1.0, 1.0, 1.0), "Roughness": 0.0, "IOR": 1.52})
    mats["glossy"] = principled("glint glossy", **{"Base Color": (1.0, 1.0, 1.0), "Metallic": 1.0, "Roughness": 0.05})
    return mats


# -------------------------------------------------------------------------------------- the flacon
def import_flacon(dims):
    bpy.ops.wm.obj_import(filepath=os.path.join(OUT, "flacon.obj"), forward_axis="Y", up_axis="Z")
    objs = {o.name: o for o in bpy.context.selected_objects}
    missing = [n for n in FLACON_PARTS if n not in objs]
    if missing:
        raise SystemExit(f"flacon.obj is missing {missing}; run node blender/export-flacon.mts first")
    for name, o in objs.items():
        faceted = name in ("stopper_finial", "stopper_cap")
        if faceted:
            # Cut-glass facets: drop the imported (smoothed) normals and shade flat.
            bpy.context.view_layer.objects.active = o
            for other in bpy.context.selected_objects:
                other.select_set(False)
            o.select_set(True)
            try:
                bpy.ops.mesh.customdata_custom_splitnormals_clear()
            except Exception as error:  # pragma: no cover - older/newer API
                log("could not clear custom normals on", name, error)
        for p in o.data.polygons:
            p.use_smooth = not faceted
    for name in STOPPER_PARTS:
        objs[name].location.z = dims["collarTopY"]
    return objs


def cut_liquid(liquid, dims, level):
    """Bisect the liquid body at the fill level and cap the cut, so the surface is a flat meniscus."""
    z = dims["liquidMinY"] + level * (dims["liquidMaxY"] - dims["liquidMinY"])
    bm = bmesh.new()
    bm.from_mesh(liquid.data)
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, z), plane_no=(0, 0, 1), clear_outer=True)
    edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    bmesh.ops.holes_fill(bm, edges=edges)
    bm.to_mesh(liquid.data)
    bm.free()
    liquid.data.update()
    return z


def make_etch(vessel, material):
    """'HVNF' in Blender's own font, conformed to the front of the foot and frosted."""
    curve = bpy.data.curves.new("etch", "FONT")
    curve.body = "HVNF"
    curve.size = 0.05
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.space_character = 1.12
    etch = bpy.data.objects.new("etch", curve)
    bpy.context.scene.collection.objects.link(etch)
    # Text lies in its local XY plane facing +Z. Rotating +90° about X stands it up facing -Y (the camera).
    etch.rotation_euler = (math.radians(90), 0, 0)
    etch.location = (0, -0.6, 0.08)
    bpy.context.view_layer.objects.active = etch
    for other in bpy.context.selected_objects:
        other.select_set(False)
    etch.select_set(True)
    bpy.ops.object.convert(target="MESH")
    etch = bpy.context.view_layer.objects.active
    etch.data.materials.clear()
    etch.data.materials.append(material)
    wrap = etch.modifiers.new("conform", "SHRINKWRAP")
    wrap.target = vessel
    wrap.wrap_method = "PROJECT"
    wrap.use_project_z = True
    wrap.use_negative_direction = True
    wrap.use_positive_direction = True
    wrap.offset = 0.0005
    solid = etch.modifiers.new("frost", "SOLIDIFY")
    solid.thickness = 0.0006
    solid.offset = 1.0
    return etch


# ---------------------------------------------------------------------------------------- the set
def make_set(material):
    """Floor plus a soft cove up to the back wall at y = +1.8. Two objects: the glass pass needs the
    floor as a shadow catcher and the wall hidden."""
    half = 2.1
    # Floor and cove as one smooth strip, profile (y, z): flat floor, then a quarter circle centred at
    # (1.2, 0.6) from the floor tangent up to the wall tangent, so there is no hard horizon line.
    radius = 0.6
    profile = [(-6.0, 0.0)]
    cy, cz = 1.8 - radius, radius
    for i in range(0, 13):
        a = -math.pi / 2 + (i / 12) * (math.pi / 2)
        profile.append((cy + radius * math.cos(a), cz + radius * math.sin(a)))
    floor = strip_mesh("floor", profile, half, material)
    wall = strip_mesh("wall", [(1.8, radius), (1.8, 6.0)], half, material)
    return floor, wall


def strip_mesh(name, profile, half, material):
    verts, faces = [], []
    for y, z in profile:
        verts.append((-half, y, z))
        verts.append((half, y, z))
    for i in range(len(profile) - 1):
        a = 2 * i
        # (+x, then along the profile) winds the normal to the camera side: +z on the floor, -y on the wall.
        faces.append((a, a + 1, a + 3, a + 2))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for p in mesh.polygons:
        p.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


# ----------------------------------------------------------------------------- the leaf gobo (port)
# Ported from src/components/hero/komorebi-backdrop.tsx (deleted with the old hero): the same seeded
# sprig generator, now cutting real shadows instead of three blurred, multiplied SVG layers.
VIEW_W, VIEW_H = 1440.0, 900.0
UNIT = 0.12 / 100.0  # 100 SVG units = 0.12 m
LAYERS = (  # seed, sprigs, leafScale
    (19, 4, 1.45),
    (7, 5, 1.05),
    (43, 4, 0.80),
)


def mulberry32(seed):
    a = seed & 0xFFFFFFFF

    def imul(x, y):
        return (x * y) & 0xFFFFFFFF

    def rand():
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = imul(t ^ (t >> 15), t | 1)
        t = (t ^ ((t + imul(t ^ (t >> 7), t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return rand


def cubic(p0, p1, p2, p3, t):
    u = 1 - t
    return (
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    )


def leaf_outline():
    """LEAF_PATH 'M0 0 C 30 20 27 72 0 100 C -27 72 -30 20 0 0 Z' sampled to 20 points (+y is the tip)."""
    pts = []
    for i in range(10):
        pts.append(cubic((0, 0), (30, 20), (27, 72), (0, 100), i / 10))
    for i in range(10):
        pts.append(cubic((0, 100), (-27, 72), (-30, 20), (0, 0), i / 10))
    return pts


LEAF = leaf_outline()


def build_sprigs(seed, count, leaf_scale):
    rand = mulberry32(seed)

    def rng(lo, hi):
        return lo + rand() * (hi - lo)

    sprigs = []
    for _ in range(count):
        from_top = rand() < 0.62
        sx = rng(-80, VIEW_W + 80) if from_top else VIEW_W + rng(20, 90)
        sy = rng(-140, -30) if from_top else rng(-40, VIEW_H * 0.75)
        tx = rng(VIEW_W * 0.1, VIEW_W * 0.9)
        ty = rng(VIEW_H * 0.25, VIEW_H * 0.95)
        dx, dy = tx - sx, ty - sy
        length = math.hypot(dx, dy)
        bow = rng(-0.28, 0.28) * length
        cx = sx + dx / 2 + (-dy / length) * bow
        cy = sy + dy / 2 + (dx / length) * bow
        leaves = []
        n = round(rng(7, 12))
        for i in range(n):
            t = 0.14 + (i / (n - 1)) * 0.86
            u = 1 - t
            px = u * u * sx + 2 * u * t * cx + t * t * tx
            py = u * u * sy + 2 * u * t * cy + t * t * ty
            gx = 2 * u * (cx - sx) + 2 * t * (tx - cx)
            gy = 2 * u * (cy - sy) + 2 * t * (ty - cy)
            heading = math.degrees(math.atan2(gy, gx)) - 90
            tip = i == n - 1
            side = 1 if i % 2 == 0 else -1
            splay = 0 if tip else side * rng(38, 64)
            scale = leaf_scale * (1.15 - 0.45 * t) * rng(0.8, 1.2)
            leaves.append((px, py, heading + splay, scale))
        sprigs.append(((sx, sy), (cx, cy), (tx, ty), leaves))
    return sprigs


def gobo_layer_mesh(name, seed, count, leaf_scale):
    """One gobo layer as a flat mesh in its local XY plane (metres, field centred, +Y up)."""
    verts, faces = [], []

    def to_local(x, y):
        return ((x - VIEW_W / 2) * UNIT, -(y - VIEW_H / 2) * UNIT, 0.0)

    for (s, c, t, leaves) in build_sprigs(seed, count, leaf_scale):
        # Stem: a ribbon 5 * leafScale units wide along the quadratic curve.
        half_w = 2.5 * leaf_scale
        base = len(verts)
        steps = 24
        for k in range(steps + 1):
            tt = k / steps
            u = 1 - tt
            px = u * u * s[0] + 2 * u * tt * c[0] + tt * tt * t[0]
            py = u * u * s[1] + 2 * u * tt * c[1] + tt * tt * t[1]
            gx = 2 * u * (c[0] - s[0]) + 2 * tt * (t[0] - c[0])
            gy = 2 * u * (c[1] - s[1]) + 2 * tt * (t[1] - c[1])
            gl = math.hypot(gx, gy) or 1
            nx, ny = -gy / gl, gx / gl
            verts.append(to_local(px + nx * half_w, py + ny * half_w))
            verts.append(to_local(px - nx * half_w, py - ny * half_w))
        for k in range(steps):
            a = base + 2 * k
            faces.append((a, a + 1, a + 3, a + 2))
        # Leaves: translate(px py) rotate(deg) scale(s) applied to the 20-point outline (SVG, y down).
        for (px, py, deg, sc) in leaves:
            th = math.radians(deg)
            ct, st = math.cos(th), math.sin(th)
            base = len(verts)
            for (lx, ly) in LEAF:
                x, y = lx * sc, ly * sc
                verts.append(to_local(px + x * ct - y * st, py + x * st + y * ct))
            faces.append(tuple(range(base, base + len(LEAF))))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    # Shadow only: never seen by the camera, in reflections, refractions or bounce light.
    obj.visible_camera = False
    obj.visible_diffuse = False
    obj.visible_glossy = False
    obj.visible_transmission = False
    obj.visible_volume_scatter = False
    obj.visible_shadow = True
    return obj


def make_gobo(place):
    """place(layer_index, obj) positions each layer. Layer 0 (seed 19, big leaves) is the softest."""
    layers = []
    for i, (seed, count, leaf_scale) in enumerate(LAYERS):
        obj = gobo_layer_mesh(f"gobo_{seed}", seed, count, leaf_scale)
        place(i, obj)
        layers.append(obj)
    return layers


# ------------------------------------------------------------------------------------------ lights
def aim(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_light(name, kind, location, target, energy, colour, **props):
    data = bpy.data.lights.new(name, kind)
    data.energy = energy
    data.color = colour
    for key, value in props.items():
        setattr(data, key, value)
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = Vector(location)
    aim(obj, target)
    return obj


def shadow_link(light, collection):
    """Only the objects in `collection` may block this light (Blender 4+ shadow linking)."""
    try:
        light.light_linking.blocker_collection = collection
    except Exception as error:  # pragma: no cover
        log("shadow linking unavailable:", error)


def set_world(colour, strength):
    world = bpy.data.worlds.new("world")
    bpy.context.scene.world = world
    try:
        world.use_nodes = True
    except Exception:
        pass
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (*colour, 1.0)
    bg.inputs["Strength"].default_value = strength


# ------------------------------------------------------------------------------------------ camera
LENS_MM = 85.0
SENSOR_MM = 36.0  # vertical sensor fit: the 36 mm side spans the frame height


def frame_extents(cam, objs, aspect):
    """Projected bounds of `objs` in frame fractions: top/bottom from the frame top, left/right, width."""
    inv = np.array(cam.matrix_world.inverted())
    tan_half = (SENSOR_MM / 2) / LENS_MM
    pts = []
    for o in objs:
        n = len(o.data.vertices)
        co = np.empty(n * 3, dtype=np.float64)
        o.data.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        m = np.array(o.matrix_world)
        pts.append(co @ m[:3, :3].T + m[:3, 3])
    p = np.vstack(pts)
    pc = p @ inv[:3, :3].T + inv[:3, 3]
    depth = -pc[:, 2]
    yf = 0.5 + 0.5 * (pc[:, 1] / depth) / tan_half
    xf = 0.5 + 0.5 * (pc[:, 0] / depth) / (tan_half * aspect)
    return {"top": 1 - yf.max(), "bottom": 1 - yf.min(), "left": xf.min(), "right": xf.max(), "width": xf.max() - xf.min()}


def make_camera(objs, aspect):
    """85 mm, vertical fit, 5:7. Solves distance and aim height so the flacon spans 24%..84% of the frame."""
    data = bpy.data.cameras.new("camera")
    data.lens = LENS_MM
    data.sensor_fit = "VERTICAL"
    data.sensor_height = SENSOR_MM
    data.clip_start = 0.1
    data.clip_end = 100
    cam = bpy.data.objects.new("camera", data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    direction = Vector((0.0, math.cos(PITCH), -math.sin(PITCH)))
    tan_half = (SENSOR_MM / 2) / LENS_MM
    aim_z, dist = 1.05, 8.6
    ext = None
    for _ in range(40):
        cam.location = Vector((0.0, 0.0, aim_z)) - direction * dist
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        bpy.context.view_layer.update()
        ext = frame_extents(cam, objs, aspect)
        span = ext["bottom"] - ext["top"]
        centre = (ext["top"] + ext["bottom"]) / 2
        dist *= span / (FRAME_BOTTOM - FRAME_TOP)
        aim_z -= (centre - (FRAME_TOP + FRAME_BOTTOM) / 2) * 2 * dist * tan_half
        if abs(span - (FRAME_BOTTOM - FRAME_TOP)) < 1e-5 and abs(centre - (FRAME_TOP + FRAME_BOTTOM) / 2) < 1e-5:
            break
    cam.location = Vector((0.0, 0.0, aim_z)) - direction * dist
    bpy.context.view_layer.update()
    ext = frame_extents(cam, objs, aspect)
    log(
        f"camera {tuple(round(v, 3) for v in cam.location)} pitch {math.degrees(PITCH):.1f}deg dist {dist:.3f}:",
        f"stopper top {ext['top'] * 100:.1f}% (22-26), base {ext['bottom'] * 100:.1f}% (82-86),",
        f"width {ext['width'] * 100:.1f}% (40-46), left {ext['left'] * 100:.1f}%",
    )
    return cam


# -------------------------------------------------------------------------------------- settings
def render_settings(size, spp, transparent=False, transparent_glass=False, exposure=0.0):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    cy = scene.cycles
    cy.device = "CPU"
    cy.samples = spp
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.01
    cy.use_denoising = True
    try:
        cy.denoiser = "OPENIMAGEDENOISE"
        cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    except Exception:
        pass
    cy.max_bounces = 16
    cy.transmission_bounces = 16
    cy.glossy_bounces = 8
    cy.diffuse_bounces = 4
    cy.transparent_max_bounces = 16
    cy.caustics_refractive = True
    cy.caustics_reflective = False
    cy.blur_glossy = 0.5
    cy.sample_clamp_indirect = 8.0
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = transparent
    cy.film_transparent_glass = transparent_glass
    cy.film_transparent_roughness = 0.1
    scene.view_settings.view_transform = "AgX"
    for look in ("AgX - Base Contrast", "None"):
        try:
            scene.view_settings.look = look
            break
        except Exception:
            continue
    scene.view_settings.exposure = exposure
    scene.view_settings.gamma = 1.0
    settings = scene.render.image_settings
    settings.file_format = "PNG"
    settings.color_mode = "RGBA" if transparent else "RGB"
    settings.color_depth = "16"
    settings.compression = 15


def hide(obj):
    obj.hide_render = True
    obj.hide_viewport = True


# -------------------------------------------------------------------------------------- the scene
# Key light: "window sun" from the left. Swung round from the spec's (-3.4, -2.2, 4.2) to the side and a
# little lower, so the flacon's shadow, and the caustic the amber focuses inside it, fall beside the
# flacon where this low camera can see them, instead of hiding behind it.
KEY_POS, KEY_AIM = (-4.2, -1.0, 3.2), (0.0, 0.2, 0.6)
KEY_POWER = 1800
# Dapple: a warm area light from the front and above, its beam narrowed (spread) onto the upper wall,
# shining through three leaf layers. From the front, the leaves land on the wall almost undistorted,
# around the stopper, and the floor stays the key's.
DAPPLE_POS, DAPPLE_AIM = (-1.0, -4.2, 3.6), (0.25, 1.8, 2.1)
DAPPLE_POWER = 700
DAPPLE_SPREAD = math.radians(40)
DAPPLE_GOBO_FROM_WALL = (0.95, 0.62, 0.36)  # per layer, metres in front of the wall along the beam
# The komorebi sprigs were sized for a 1440 px page; beside a 2.2-unit flacon they read as confetti.
# Scaled up, a leaf is about a quarter of the bottle's height, as a real sprig would be at a window.
GOBO_SCALE_FLACON = 2.6


def build_flacon_scene(job, size, spp, key_only=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    dims = json.load(open(os.path.join(OUT, "flacon.json")))
    mats = make_materials()
    objs = import_flacon(dims)
    level = LEVELS.get(job, 0.62)
    cut_z = cut_liquid(objs["liquid"], dims, level)
    log(f"job {job}: liquid level {level} cut at z={cut_z:.4f}")

    assign = {
        "vessel": mats["crystal"],
        "liquid": mats["amber"],
        "collar": mats["brass"],
        "stopper_shank": mats["ground"],
        "stopper_seat": mats["brass"],
        "stopper_finial": mats["crystal"],
        "stopper_cap": mats["brass"],
    }
    for name, material in assign.items():
        objs[name].data.materials.clear()
        objs[name].data.materials.append(material)
    etch = make_etch(objs["vessel"], mats["etch"])

    # Shadow caustics (MNEE): light through the crystal and the amber focuses on the floor.
    for name in ("vessel", "liquid"):
        objs[name].cycles.is_caustics_caster = True

    floor, wall = make_set(mats["set"])
    floor.cycles.is_caustics_receiver = True

    flacon_coll = bpy.data.collections.new("flacon")
    scene.collection.children.link(flacon_coll)
    for o in list(objs.values()) + [etch]:
        flacon_coll.objects.link(o)

    # Lights.
    # A wide, soft-edged cone: at 40 degrees / .25 blend its pool drew a hard stage-light ellipse across
    # the floor; at 75 / .7 the falloff reads as window light and its edge leaves the frame.
    key = add_light("window sun", "SPOT", KEY_POS, KEY_AIM, KEY_POWER, (1.0, 0.94, 0.86), spot_size=math.radians(75), spot_blend=0.7, shadow_soft_size=0.04)
    key.data.cycles.is_caustics_light = True
    shadow_link(key, flacon_coll)
    dapple = add_light("dapple", "AREA", DAPPLE_POS, DAPPLE_AIM, DAPPLE_POWER, (1.0, 0.9, 0.76), size=0.8, spread=DAPPLE_SPREAD)
    fill = add_light("fill", "AREA", (-4.5, -2.5, 2.5), (0.0, 0.0, 1.0), 300, (1.0, 0.98, 0.95), shape="RECTANGLE", size=2.5, size_y=3.5)
    shadow_link(fill, flacon_coll)
    rim = add_light("rim", "AREA", (2.4, 2.0, 1.8), (0.0, 0.0, 1.0), 120, (1.0, 0.97, 0.92), shape="RECTANGLE", size=0.6, size_y=2.0)
    shadow_link(rim, flacon_coll)
    set_world(WORLD, 0.4)
    if key_only:
        # Diagnostic: the key alone (plus a dim world), to see its shadow and the MNEE caustic plainly.
        for light in (dapple, fill, rim):
            hide(light)
        set_world(WORLD, 0.05)

    # Leaf gobo: each layer square to the dapple beam, nearer the wall = sharper shadow.
    beam = (Vector(DAPPLE_AIM) - Vector(DAPPLE_POS)).normalized()

    def place(i, obj):
        obj.location = Vector(DAPPLE_AIM) - beam * DAPPLE_GOBO_FROM_WALL[i]
        obj.rotation_euler = (-beam).to_track_quat("Z", "Y").to_euler()
        obj.scale = (GOBO_SCALE_FLACON,) * 3

    gobo = make_gobo(place)

    aspect = size[0] / size[1]
    framing = [objs["vessel"], objs["stopper_finial"], objs["stopper_cap"], objs["collar"]]
    make_camera(framing, aspect)

    transparent = False
    transparent_glass = False
    flacon_all = list(objs.values()) + [etch]
    if job == "set":
        for o in flacon_all:
            hide(o)
    elif job == "glass":
        hide(objs["liquid"])
        for g in gobo:
            hide(g)
        # Floor AND wall catch the flacon's shadow. With the wall hidden, the shadow stopped dead where
        # the cove met it, a hard edge over the set layer in the browser's composite.
        floor.is_shadow_catcher = True
        wall.is_shadow_catcher = True
        transparent = transparent_glass = True
    elif job.startswith("liquid"):
        objs["liquid"].data.materials.clear()
        objs["liquid"].data.materials.append(mats["white"])
        objs["vessel"].data.materials.clear()
        objs["vessel"].data.materials.append(mats["refraction"])
        for o in (floor, wall, etch, *gobo, *(objs[n] for n in ("collar", *STOPPER_PARTS))):
            hide(o)
        transparent = transparent_glass = True
    elif job == "glint":
        objs["vessel"].data.materials.clear()
        objs["vessel"].data.materials.append(mats["glossy"])
        for o in (floor, wall, etch, *gobo, objs["liquid"], *(objs[n] for n in ("collar", *STOPPER_PARTS))):
            hide(o)
        for light in (key, dapple, fill, rim):
            hide(light)
        set_world((0.0, 0.0, 0.0), 0.0)
        # One tall strip softbox: aim() keeps its local Y (the 3 m side) upright.
        add_light("strip", "AREA", (-1.2, -3.0, 1.4), (0.0, 0.0, 1.0), 260, (1.0, 1.0, 1.0), shape="RECTANGLE", size=0.15, size_y=3.0)
        transparent = True
    render_settings(size, spp, transparent, transparent_glass, exposure=0.0 if key_only or job == "glint" else EXPOSURE)


def build_leaflight_scene(size, spp):
    """The page's leaf light: linen paper seen square-on, leaf shadows from the same three layers."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    mats = make_materials()
    bpy.ops.mesh.primitive_plane_add(size=4.0, location=(0, 0, 0))
    paper = bpy.context.active_object
    paper.data.materials.append(mats["linen"])

    # Layers float just above the paper: the higher, the softer (komorebi blurred them 22/11/5 px).
    heights = (0.30, 0.16, 0.075)

    def place(i, obj):
        obj.location = (0.0, 0.0, heights[i])

    make_gobo(place)
    light_pos = (-0.85, 0.75, 3.0)
    dapple = add_light("dapple", "POINT", light_pos, (0.0, 0.0, 0.0), 220, (1.0, 0.93, 0.82), shadow_soft_size=0.3)
    # Ambient sky light fills the shadows: the deepest overlap lands about 8% under the paper.
    set_world(WORLD, 0.85)
    data = bpy.data.cameras.new("ortho")
    data.type = "ORTHO"
    data.ortho_scale = VIEW_W * UNIT / 1.2  # komorebi layers were 120% of the viewport
    data.sensor_fit = "HORIZONTAL"
    cam = bpy.data.objects.new("ortho", data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.location = (0.0, 0.0, 5.0)
    cam.rotation_euler = (0.0, 0.0, 0.0)
    _ = dapple
    render_settings(size, spp, False, False)


# ------------------------------------------------------------------------------------------- run
def render(path):
    bpy.context.scene.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    log(f"wrote {path} in {time.time() - t:.1f}s")


def run_job(job, size=None, spp=None, out_dir=OUT, suffix=""):
    key_only = job.endswith("-keyonly")
    base_job = job[: -len("-keyonly")] if key_only else job
    (default_size, default_spp, stem) = JOBS[base_job]
    size = size or default_size
    spp = spp or default_spp
    if base_job == "leaflight":
        build_leaflight_scene(size, spp)
    else:
        build_flacon_scene(base_job, size, spp, key_only=key_only)
    render(os.path.join(out_dir, f"{stem}{'-keyonly' if key_only else ''}{suffix}.png"))


def parse_size(text):
    w, h = text.lower().split("x")
    return (int(w), int(h))


if JOB == "preview":
    preview_dir = os.path.join(OUT, "previews", "raw")
    os.makedirs(preview_dir, exist_ok=True)
    spp = int(SPP_OVERRIDE) if SPP_OVERRIDE else 16
    which = arg("--only")
    jobs = which.split(",") if which else ["poster", "set", "glass", "liquid-mid", "glint", "leaflight"]
    # --pitches 6,2 renders the flacon jobs once per camera pitch (suffix -p<deg>), to compare framings.
    pitches = [float(v) for v in arg("--pitches").split(",")] if arg("--pitches") else [None]
    for job in jobs:
        size = (320, 200) if job == "leaflight" else parse_size(SIZE_OVERRIDE) if SIZE_OVERRIDE else (240, 336)
        for pitch in pitches if job != "leaflight" else [None]:
            if pitch is not None:
                PITCH = math.radians(pitch)
            run_job(job, size=size, spp=spp, out_dir=preview_dir, suffix="-preview" + (f"-p{pitch:g}" if pitch is not None else ""))
elif JOB == "batch":
    # Several final jobs in one Blender session (one slot hold): --jobs set,glass,liquid-mid
    for job in arg("--jobs", "").split(","):
        if job:
            run_job(job, spp=int(SPP_OVERRIDE) if SPP_OVERRIDE else None)
elif JOB in JOBS:
    run_job(JOB, size=parse_size(SIZE_OVERRIDE) if SIZE_OVERRIDE else None, spp=int(SPP_OVERRIDE) if SPP_OVERRIDE else None)
else:
    raise SystemExit(f"unknown job {JOB!r}; expected one of {', '.join(JOBS)} or preview")

log("done")
