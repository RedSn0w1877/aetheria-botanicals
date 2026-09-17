# Deployment Guide — Aetheria Botanicals

## Quick Deploy to GitHub Pages

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Aetheria Botanicals showcase

- Complete 6-section landing page
- Three.js 3D flacon with custom shaders
- GSAP scroll-driven animations
- Lenis smooth scroll
- Interactive compound blender
- Terroir inspector with harvest lots
- Pinned ritual extraction sequence
- Allocation drawer with canvas confetti
- Full accessibility support (reduced motion, keyboard nav)
- 13 performance optimizations applied
- Comprehensive documentation

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

### 2. Create GitHub Repository

```bash
# Create repo on GitHub (via web UI or gh CLI)
gh repo create aetheria-botanicals --public --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Name: aetheria-botanicals
# 3. Public
# 4. Don't initialize with README (we already have one)
```

### 3. Configure GitHub Pages

```bash
# Push to GitHub
git branch -M main
git push -u origin main

# Enable GitHub Pages (via web UI or gh CLI)
gh repo edit --enable-pages --pages-branch gh-pages
```

### 4. Deploy Script

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5. Push Workflow

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push
```

## Manual Deploy

If you prefer manual deployment:

```bash
# Build locally
npm run build

# Install gh-pages package
npm install -D gh-pages

# Add deploy script to package.json
"scripts": {
  "deploy": "gh-pages -d out -t true"
}

# Deploy
npm run deploy
```

The `-t true` flag includes dotfiles (like `.nojekyll`).

## Site URL

After deployment, your site will be available at:

```
https://<username>.github.io/aetheria-botanicals/
```

## Environment Variables

No environment variables needed. The `basePath` automatically switches based on `NODE_ENV`:

```typescript
// next.config.ts
basePath: process.env.NODE_ENV === "production" ? "/aetheria-botanicals" : ""
```

## Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file to `public/` directory:
   ```
   aetheria-botanicals.yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to `<username>.github.io`
   - Or A records to GitHub Pages IPs

3. Update `next.config.ts`:
   ```typescript
   basePath: process.env.NODE_ENV === "production" ? "" : ""
   ```

4. Enable custom domain in GitHub repo settings

## Build Verification

Before deploying, verify the build:

```bash
npm run build
npx serve out -p 3000
```

Open `http://localhost:3000/aetheria-botanicals/` to test.

## Troubleshooting

### 404 on Routes

GitHub Pages serves `index.html` automatically, but subpages need `trailingSlash: true` (already configured).

### Assets Not Loading

Check that all asset paths are relative or use `basePath`. The config already handles this.

### Three.js Not Loading

Ensure dynamic import with `ssr: false` is working (already implemented in `lazy-flacon.tsx`).

### Build Fails

- Check Node version: requires Node 18+
- Clear cache: `rm -rf .next out node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Performance on GitHub Pages

GitHub Pages serves static files from a CDN, so expect:
- **First load**: ~1.5s on 3G (372K HTML + critical chunks)
- **Three.js lazy load**: +968K when flacon enters viewport
- **Time to Interactive**: ~2.5s on desktop, ~4s on mobile

The build already includes all optimizations from the performance audit.

## Monitoring

After deployment, run Lighthouse:

```bash
npx lighthouse https://<username>.github.io/aetheria-botanicals/ --view
```

Expected scores:
- **Performance**: 85-95 (Three.js impacts score, but experience is smooth)
- **Accessibility**: 95-100
- **Best Practices**: 90-100
- **SEO**: 90-100

## Updating

To update the deployed site:

```bash
# Make changes
git add .
git commit -m "Update: description

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push

# GitHub Actions will automatically rebuild and deploy
```

---

**Note**: This is a portfolio showcase piece. The copyright notice and watermarks must remain in place per the HVNF Studios license.
