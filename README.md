# Twilight Town portfolio — Phase 2

A static portfolio with a compact 3D town blockout. The portfolio remains the default view. The town preview has no movement or interactions yet.

## Run

Use Node.js 22.20.0 or a compatible current LTS release.

```sh
npm install
npm run dev
npm run build
npm run preview
```

Installed versions: Vite 8.3.8, React 19.3.1, TypeScript 7.0.2, Three.js 0.187.0, React Three Fiber 9.8.2, and Drei 10.7.9. The lockfile records exact versions for the complete dependency tree.

## Content

Edit `src/data/portfolio.ts` to update both the HTML portfolio and future world panels. Project summaries describe the linked repositories without claiming personal contributions. Experience details come from the supplied resume, which is served unchanged from `public/resume.pdf`. The About text remains a placeholder. The contact email comes from the supplied plan.

## Phase 2 blockout

`src/world/Town.tsx` uses primitive geometry for the flat map, clock square, notice board, town hall, post box, observatory, houses, trees, lanterns, and paths. `src/world/WorldCanvas.tsx` sets a fixed elevated orthographic camera and fixed twilight lighting; a CSS moon sits behind the transparent canvas. Movement, interactions, interiors, timers, and backend services are not part of Phase 2.
