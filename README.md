# Twilight Town portfolio — Phase 6

A static portfolio with a compact 3D town. The portfolio remains the default view. The original miniature character can walk to town landmarks, enter the observatory, use its telescope to read the Tranquility Base panel, and exit back to town.

## Run

Use Node.js 22.20.0 or a compatible current LTS release.

```sh
npm install
npm run dev
npm run build
npm test
npm run preview
```

Installed versions: Vite 8.3.8, React 19.3.1, TypeScript 7.0.2, Three.js 0.187.0, React Three Fiber 9.8.2, and Drei 10.7.9. The lockfile records exact versions for the complete dependency tree.

## Content

Edit `src/data/portfolio.ts` to update both the HTML portfolio and future world panels. Project summaries describe the linked repositories without claiming personal contributions. Experience details come from the supplied resume, which is served unchanged from `public/resume.pdf`. The About text remains a placeholder. The contact email comes from the supplied plan.

## Phase 5 observatory

`src/world/Observatory.tsx` builds a cutaway room, telescope, and exit from primitive geometry. `src/world/interactions.ts` declares town and interior anchors. `src/App.tsx` fades between scenes, resets player and camera to safe spawn points, and skips the fade for reduced motion. `src/ui/ProjectDialog.tsx` gives the telescope panel a lunar backdrop and reads its verified demo and GitHub links from `src/data/portfolio.ts`. An asset error boundary supplies primitive fallbacks; interaction anchors remain usable if detail rendering fails. Timers, NPC dialogue, quests, and backend services are not included.

## Phase 6 art and asset credits

The miniature kit consists of the character, clock tower, house module, town hall facade, notice board, post box, observatory dome and telescope, evergreen trees, and lanterns. All meshes and materials are original, authored in this repository with React Three Fiber and Three.js primitives; no third-party model, texture, or audio is used. The exported `public/models/town.glb` and `public/models/observatory.glb` contain this original geometry and have no third-party attribution obligation; use and modification follow the repository's terms. The character remains an original code-native model so its subtle walking bob can run independently. `src/world/palette.ts` keeps cream stone, roof purple, muted green, warm gold, deep blue, and steel blue consistent. All decorative geometry begins at the approved ground plane; colliders and interaction anchors remain in their original data files. `BatchedStaticKit` merges stationary town meshes by material and shadow behavior before export.

Town and observatory GLBs load on demand within the canvas with predictable scene origins and scale 1. Their Suspense fallbacks are simple landmark geometry, and asset errors show the same navigable fallbacks plus a visible status message. The direct HTML portfolio button remains available. Walking bob and faint star opacity motion stop for visitors who request reduced motion. Lighting stays fixed; the moon and clock remain decorative. The model source stays in `Town.tsx` and `Observatory.tsx`; with the Vite dev server running and Edge remote debugging on port 9222, `node scripts/export-phase6.mjs` regenerates both GLBs from the dev-only export views.

## Phase 6 measured performance

Measured November 21, 2026 at a 1440 x 900 browser viewport in headless Microsoft Edge with software WebGL (SwiftShader). Five-second samples after loading recorded **town: 68 draw calls, 9,274 triangles, 11.4 FPS** and **observatory: 71 draw calls, 5,113 triangles, 20.7 FPS**. The software renderer is slower than a normal GPU, so these FPS values are not laptop gameplay claims. Draw calls and triangles are below the plan's starting budgets of 150 and 100k–200k respectively. The town GLB is **236,548 bytes** and the observatory GLB **106,604 bytes**; each is well below the 8 MB starting download budget. The model loader chunk is 21.11 KB gzip and the initial JS chunk is 320.49 KB gzip. The full 3D framework still ships in the initial application chunk; lazy loading the whole world is Phase 7 scope.

The measurement script is `node scripts/measure-phase6.mjs` or `node scripts/measure-phase6.mjs --observatory` against a local Vite dev server and an Edge remote debugging session on port 9222. It writes the screenshots in `preview/`; the scene also exposes its one-time five-second sample as `window.__twilightMetrics`. Production build and all seven movement/interaction tests pass. A hardware browser and phone review remain necessary before release.
