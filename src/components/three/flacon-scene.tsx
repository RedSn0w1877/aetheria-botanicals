"use client";

// © 2026 HVNF Studios. All rights reserved. Portfolio sample — do not redistribute.

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useInView, useReducedMotion } from "motion/react";
import { COPYRIGHT_MARK } from "@/lib/copyright";
import type { FlaconSource } from "@/lib/flacon-store";
import type { FlaconSceneProps } from "./flacon-types";
import {
  FLACON,
  STAGE_LAYER,
  clamp01,
  createCollarGeometry,
  createLiquidGeometry,
  createPetalGeometry,
  createStopperCapGeometry,
  createStopperFinialGeometry,
  createStopperSeatGeometry,
  createStopperShankGeometry,
  createVesselGeometry,
  liquidRadiusAt,
  mulberry32,
  smoothstep,
} from "./flacon-geometry";

type Variant = FlaconSceneProps["variant"];
type PointerRef = { current: { x: number; y: number } };

const HERO_TINCTURE = new THREE.Color().setRGB(0.69, 0.47, 0.2, THREE.SRGBColorSpace);
const FOV = 30;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
/** Where the flacon's base sits in the frame (NDC), matching the shelf line the arches draw. */
const BASE_NDC = -0.7;

const hasLiquid = (source: FlaconSource): source is FlaconSource & { liquid: { r: number; g: number; b: number }; level: number; swirl: number } =>
  "liquid" in source;

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

/**
 * Frames the flacon so its base lands on the arch's shelf and a fully lifted
 * stopper still clears the top. On tall, narrow canvases it backs away far
 * enough that the shoulders never touch the sides.
 */
function CameraRig({ variant }: { variant: Variant }) {
  const get = useThree((s) => s.get);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  useLayoutEffect(() => {
    // Half-height of the view at the flacon, in world units.
    const halfHeight = variant === "hero" ? 1.86 : 1.7;
    const halfWidthNeeded = 0.72;
    const half = Math.max(halfHeight, halfWidthNeeded / Math.max(aspect, 0.2));
    const distance = half / TAN;
    // Look at the height that puts y = 0 at BASE_NDC.
    const lookY = -BASE_NDC * half;
    const elevation = THREE.MathUtils.degToRad(6);
    const camera = get().camera as THREE.PerspectiveCamera;
    camera.fov = FOV;
    camera.near = 0.1;
    camera.far = 60;
    camera.position.set(0, lookY + Math.sin(elevation) * distance, Math.cos(elevation) * distance);
    camera.lookAt(0, lookY, 0);
    camera.layers.enable(STAGE_LAYER);
    camera.updateProjectionMatrix();
  }, [get, aspect, variant]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Soft point shaders (motes + vapour)                                 */
/* ------------------------------------------------------------------ */

const SOFT_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

const MOTE_VERTEX = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeight;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime;
    // Slow rise with a wrap, plus a lazy lateral wander.
    float y = mod(p.y + t * (0.025 + aSeed * 0.035), uHeight);
    p.y = y - 0.25;
    p.x += sin(t * 0.21 + aSeed * 40.0) * 0.22;
    p.z += cos(t * 0.17 + aSeed * 25.0) * 0.16;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (260.0 / -mv.z);
    float edge = smoothstep(0.0, 0.5, y) * (1.0 - smoothstep(uHeight - 0.8, uHeight, y));
    float glint = 0.55 + 0.45 * sin(t * 0.9 + aSeed * 50.0);
    vAlpha = edge * glint * (0.35 + 0.65 * fract(aSeed * 7.13));
    vColor = aColor;
  }
`;

const VAPOUR_VERTEX = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOrigin;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * (0.16 + aSeed * 0.08) + aSeed * 13.0);
    float swirl = aSeed * 6.2831;
    vec3 p = vec3(
      sin(life * 3.4 + swirl) * 0.16 * life + (aSeed - 0.5) * 0.05,
      uOrigin + life * 1.5,
      cos(life * 2.7 + swirl) * 0.12 * life
    );
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (18.0 + life * 70.0) * uPixelRatio * (1.0 / -mv.z) * 6.0;
    vAlpha = sin(life * 3.14159) * (1.0 - life) * 0.9;
    vColor = mix(vec3(0.66, 0.6, 0.52), vec3(0.8, 0.74, 0.64), life);
  }
`;

function Motes({ count, reduce }: { count: number; reduce: boolean }) {
  const points = useRef<THREE.Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(0xae019 + count);
    const palette = ["#a88243", "#b8583d", "#7d8a74", "#c9a86a"].map((hex) => new THREE.Color(hex));
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // A loose column around the flacon, deeper than it is wide, with a gap at its heart.
      let x = (rand() - 0.5) * 3.6;
      if (Math.abs(x) < 0.35) x += Math.sign(x || 1) * 0.35;
      positions.set([x, rand() * 3.3, (rand() - 0.5) * 2.6], i * 3);
      const c = palette[Math.floor(rand() * palette.length)] ?? palette[0];
      colors.set([c.r, c.g, c.b], i * 3);
      seeds[i] = rand();
      sizes[i] = 0.6 + rand() * 1.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: MOTE_VERTEX,
      fragmentShader: SOFT_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uHeight: { value: 3.3 },
        uOpacity: { value: 0.85 },
      },
      transparent: true,
      depthWrite: false,
    });
    return { geometry: g, material: m };
  }, [count]);

  useLayoutEffect(() => {
    points.current?.layers.set(STAGE_LAYER);
  }, []);

  const live = useRef<THREE.ShaderMaterial | null>(null);
  useEffect(() => {
    live.current = material;
    return () => {
      live.current = null;
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const m = live.current;
    if (!m) return;
    const uniforms = m.uniforms;
    uniforms.uPixelRatio.value = dpr;
    // Reduced motion: the field barely breathes.
    uniforms.uTime.value += Math.min(delta, 1 / 20) * (reduce ? 0.08 : 1);
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

function Vapour({ source, reduce }: { source: FlaconSource; reduce: boolean }) {
  const points = useRef<THREE.Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(0x5eed);
    const n = 56;
    const seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) seeds[i] = rand();
    const g = new THREE.BufferGeometry();
    // Positions are computed in the shader; the attribute only sets the vertex count.
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: VAPOUR_VERTEX,
      fragmentShader: SOFT_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uOrigin: { value: FLACON.collarTopY },
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });
    return { geometry: g, material: m };
  }, []);

  useLayoutEffect(() => {
    points.current?.layers.set(STAGE_LAYER);
  }, []);

  const live = useRef<THREE.ShaderMaterial | null>(null);
  const sourceRef = useRef(source);
  useEffect(() => {
    sourceRef.current = source;
  }, [source]);
  useEffect(() => {
    live.current = material;
    return () => {
      live.current = null;
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const m = live.current;
    if (!m) return;
    const u = m.uniforms;
    const src = sourceRef.current;
    const lift = stopperLift(src);
    const target = clamp01(src.vapour) * smoothstep(0.04, 0.3, lift) * 0.55;
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, target, 3, delta);
    u.uPixelRatio.value = dpr;
    u.uTime.value += Math.min(delta, 1 / 20) * (reduce ? 0.25 : 1);
    if (points.current) points.current.visible = u.uOpacity.value > 0.004;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Petals                                                              */
/* ------------------------------------------------------------------ */

type PetalSeed = { x: number; z: number; phase: number; speed: number; spin: number; scale: number; tint: string };

function Petals({ count, reduce }: { count: number; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createPetalGeometry(), []);
  const seeds = useMemo<PetalSeed[]>(() => {
    const rand = mulberry32(0x9e7a1 + count);
    const tints = ["#c46a4d", "#d98e7a", "#b8583d", "#e2b3a2"];
    return Array.from({ length: count }, (_, i) => {
      let x = (rand() - 0.5) * 3.4;
      if (Math.abs(x) < 0.55) x = Math.sign(x || 1) * (0.55 + rand() * 0.5);
      return {
        x,
        z: (rand() - 0.5) * 2.2,
        phase: rand(),
        speed: 0.035 + rand() * 0.03,
        spin: 0.3 + rand() * 0.5,
        scale: 0.08 + rand() * 0.05,
        tint: tints[i % tints.length] ?? "#c46a4d",
      };
    });
  }, [count]);
  const materials = useMemo(
    () =>
      seeds.map(
        (s) => new THREE.MeshStandardMaterial({ color: s.tint, vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }),
      ),
    [seeds],
  );

  useLayoutEffect(() => {
    group.current?.traverse((o) => o.layers.set(STAGE_LAYER));
  }, [seeds]);

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime * (reduce ? 0.05 : 1);
    const span = 3.6;
    g.children.forEach((child, i) => {
      const s = seeds[i];
      if (!s) return;
      const fall = (s.phase + t * s.speed) % 1;
      child.position.set(
        s.x + Math.sin(t * 0.5 + s.phase * 9) * 0.25,
        3.3 - fall * span,
        s.z + Math.cos(t * 0.4 + s.phase * 7) * 0.15,
      );
      child.rotation.set(t * s.spin + s.phase * 6, t * s.spin * 0.7, Math.sin(t * 0.8 + s.phase * 5) * 0.9);
      // Fade in at the top and out near the shelf by scaling.
      const edge = smoothstep(0, 0.12, fall) * (1 - smoothstep(0.85, 1, fall));
      child.scale.setScalar(s.scale * edge);
    });
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} geometry={geometry} material={materials[i]} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The flacon                                                          */
/* ------------------------------------------------------------------ */

/** Blender flacons open a crack while a composition "breathes"; the hero follows the scroll. */
function stopperLift(source: FlaconSource): number {
  const lift = clamp01(source.capLift);
  return hasLiquid(source) ? Math.max(lift, clamp01(source.vapour) * 0.32) : lift;
}

function Flacon({
  source,
  variant,
  parallax,
  pointer,
  reduce,
}: {
  source: FlaconSource;
  variant: Variant;
  parallax: number;
  pointer: PointerRef;
  reduce: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const stopper = useRef<THREE.Group>(null);
  const meniscus = useRef<THREE.Mesh>(null);
  const turntable = useRef(0);
  const level = useRef(hasLiquid(source) ? source.level : FLACON.heroLevel);

  const geo = useMemo(
    () => ({
      vessel: createVesselGeometry(),
      liquid: createLiquidGeometry(),
      collar: createCollarGeometry(),
      shank: createStopperShankGeometry(),
      seat: createStopperSeatGeometry(),
      finial: createStopperFinialGeometry(),
      cap: createStopperCapGeometry(),
      disc: new THREE.CircleGeometry(1, 72).rotateX(-Math.PI / 2),
    }),
    [],
  );

  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);

  const mats = useMemo(() => {
    const tincture = hasLiquid(source)
      ? new THREE.Color().setRGB(source.liquid.r, source.liquid.g, source.liquid.b, THREE.SRGBColorSpace)
      : HERO_TINCTURE.clone();
    return {
      glass: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transmission: 1,
        thickness: 0.7,
        ior: 1.5,
        roughness: 0.04,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        attenuationColor: new THREE.Color("#f3e7d2"),
        attenuationDistance: 2.4,
        specularIntensity: 1,
        envMapIntensity: 1.25,
      }),
      liquid: new THREE.MeshPhysicalMaterial({
        color: tincture,
        roughness: 0.16,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        sheen: 0.4,
        sheenColor: new THREE.Color("#fff1d6"),
        emissive: tincture.clone().multiplyScalar(0.12),
        clippingPlanes: [clipPlane],
      }),
      meniscus: new THREE.MeshPhysicalMaterial({
        color: tincture.clone().offsetHSL(0, -0.05, 0.08),
        roughness: 0.08,
        clearcoat: 1,
        emissive: tincture.clone().multiplyScalar(0.1),
      }),
      brass: new THREE.MeshStandardMaterial({ color: "#a88243", metalness: 1, roughness: 0.34, envMapIntensity: 1.1 }),
      frosted: new THREE.MeshPhysicalMaterial({
        color: "#f4efe6",
        transmission: 0.85,
        roughness: 0.55,
        thickness: 0.2,
        ior: 1.5,
      }),
      cut: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transmission: 1,
        thickness: 0.5,
        ior: 1.52,
        roughness: 0.02,
        clearcoat: 1,
        flatShading: true,
        specularIntensity: 1,
        envMapIntensity: 1.5,
      }),
    };
    // The tincture only seeds the first frame; the loop eases it after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipPlane]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );

  // Scratch objects, allocated once.
  const scratch = useMemo(
    () => ({
      color: new THREE.Color(),
      normal: new THREE.Vector3(),
      down: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      local: new THREE.Plane(),
      quat: new THREE.Quaternion(),
    }),
    [],
  );

  const live = useRef<{ mats: typeof mats; scratch: typeof scratch; clipPlane: THREE.Plane } | null>(null);
  const sourceRef = useRef(source);
  useEffect(() => {
    sourceRef.current = source;
  }, [source]);
  useEffect(() => {
    live.current = { mats, scratch, clipPlane };
    return () => {
      live.current = null;
    };
  }, [mats, scratch, clipPlane]);

  useFrame((state, rawDelta) => {
    const g = root.current;
    const l = live.current;
    if (!g || !l) return;
    const { mats: mt, scratch: sc, clipPlane: plane } = l;
    const src = sourceRef.current;
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;

    // Turntable + scroll spin + damped pointer parallax.
    if (!reduce) turntable.current += dt * (variant === "hero" ? 0.16 : 0.12);
    const p = pointer.current;
    const targetY = turntable.current + src.spin + p.x * 0.45 * parallax;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 2.4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -p.y * 0.06 * parallax, 2.4, dt);
    g.updateMatrixWorld();

    // Stopper: rises clear of the collar and turns slowly as it hovers.
    const lift = stopperLift(src);
    const s = stopper.current;
    if (s) {
      const eased = lift * lift * (3 - 2 * lift);
      s.position.y = THREE.MathUtils.damp(s.position.y, FLACON.collarTopY + eased * FLACON.stopperLift, 6, dt);
      s.rotation.y = eased * 1.4 + (reduce ? 0 : t * 0.25 * eased);
      s.rotation.z = reduce ? 0 : Math.sin(t * 0.7) * 0.05 * eased;
    }

    // Liquid: colour, level and swirl.
    let swirl = 0;
    if (hasLiquid(src)) {
      sc.color.setRGB(src.liquid.r, src.liquid.g, src.liquid.b, THREE.SRGBColorSpace);
      mt.liquid.color.lerp(sc.color, 1 - Math.exp(-dt * 2.2));
      level.current = THREE.MathUtils.damp(level.current, clamp01(src.level), 2.2, dt);
      src.swirl = Math.max(0, src.swirl * Math.exp(-dt * 1.4) - dt * 0.01);
      swirl = reduce ? 0 : src.swirl;
    }
    mt.liquid.emissive.copy(mt.liquid.color).multiplyScalar(0.12);
    mt.meniscus.color.copy(mt.liquid.color).offsetHSL(0, -0.05, 0.08);
    mt.meniscus.emissive.copy(mt.liquid.color).multiplyScalar(0.1);

    const surfaceY = FLACON.liquidMinY + level.current * (FLACON.liquidMaxY - FLACON.liquidMinY);
    const tilt = swirl * 0.14 * Math.sin(t * 5.5);
    const heading = t * 3.1;
    sc.normal.set(Math.sin(tilt) * Math.cos(heading), Math.cos(tilt), Math.sin(tilt) * Math.sin(heading)).normalize();

    // Keep everything below the tilted surface: plane normal points down into the liquid.
    sc.local.set(sc.down.copy(sc.normal).negate(), surfaceY);
    plane.copy(sc.local).applyMatrix4(g.matrixWorld);

    const m = meniscus.current;
    if (m) {
      const r = liquidRadiusAt(surfaceY) * (1 - Math.abs(tilt) * 0.2);
      m.position.set(0, surfaceY, 0);
      m.scale.set(r, 1, r);
      m.quaternion.setFromUnitVectors(sc.up, sc.normal);
    }
  });

  return (
    <group ref={root}>
      <mesh geometry={geo.liquid} material={mats.liquid} />
      <mesh ref={meniscus} geometry={geo.disc} material={mats.meniscus} />
      <mesh geometry={geo.vessel} material={mats.glass} />
      <mesh geometry={geo.collar} material={mats.brass} />
      <group ref={stopper} position={[0, FLACON.collarTopY, 0]}>
        <mesh geometry={geo.shank} material={mats.frosted} />
        <mesh geometry={geo.seat} material={mats.brass} />
        <mesh geometry={geo.finial} material={mats.cut} />
        <mesh geometry={geo.cap} material={mats.brass} />
      </group>
      <Vapour source={source} reduce={reduce} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export default function FlaconScene({ source, variant, parallax = 0.5, motes, className }: FlaconSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper, { margin: "240px 0px" });
  const reduce = useReducedMotion() ?? false;
  const pointer = useRef({ x: 0, y: 0 });
  const moteCount = motes ?? (variant === "hero" ? 900 : 420);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrapper} className={`relative h-full w-full ${className ?? ""}`}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ fov: FOV, position: [0, 1.4, 7] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        <CameraRig variant={variant} />

        {/* Morning sun through a window, a cool bounce, and a rim to find the glass edges. */}
        <ambientLight intensity={0.35} color="#fff4e2" />
        <directionalLight position={[-3.5, 4.5, 3]} intensity={2.2} color="#ffe9c8" />
        <directionalLight position={[3, 2, 2]} intensity={0.6} color="#dfe6ea" />
        <directionalLight position={[0.5, 3, -4]} intensity={1.4} color="#fff8ee" />

        <Environment resolution={256} background={false}>
          <Lightformer form="rect" intensity={4} color="#fff3df" position={[-3, 2.2, 2.5]} scale={[1.4, 4.2, 1]} target={[0, 1, 0]} />
          <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[3, 1.6, 1.5]} scale={[0.8, 3.2, 1]} target={[0, 1, 0]} />
          <Lightformer form="rect" intensity={2.2} color="#fffaf2" position={[0, 2, -3.5]} scale={[4, 1.2, 1]} target={[0, 1, 0]} />
          <Lightformer form="ring" intensity={1.2} color="#f6e7cf" position={[0, 5, 0]} scale={2.5} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.9} color="#eadfcb" position={[0, -1.5, 3]} scale={[8, 1.5, 1]} target={[0, 1, 0]} />
        </Environment>

        <Flacon source={source} variant={variant} parallax={parallax} pointer={pointer} reduce={reduce} />
        <Motes count={moteCount} reduce={reduce} />
        <Petals count={variant === "hero" ? 9 : 5} reduce={reduce} />

        <ContactShadows position={[0, 0.001, 0]} scale={3.2} blur={2.6} far={1.2} opacity={0.38} resolution={512} color="#18231c" />
      </Canvas>

      <p className="pointer-events-none absolute bottom-2 right-3 select-none font-sans text-[9px] uppercase tracking-[0.3em] text-rosemary/40">
        Glass study {COPYRIGHT_MARK}
      </p>
    </div>
  );
}
