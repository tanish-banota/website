# Twilight Town portfolio — Phase 7

A static portfolio with a compact 3D town. Visitors arrive in the town first, with the portfolio one click away in the upper-right view switch. The original miniature character can walk to town landmarks, enter the observatory, use its telescope to read the Tranquility Base panel, and exit back to town.

## Run

Use Node.js 22.20.0 or a compatible current LTS release.

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

Installed versions: Vite 8.3.8, React 19.3.1, TypeScript 7.0.2, Three.js 0.187.0, React Three Fiber 9.8.2, and Drei 10.7.9. The lockfile records exact versions for the complete dependency tree.

## Content

Edit `src/data/portfolio.ts` to update both the HTML portfolio and world panels. Project summaries describe the linked repositories without claiming personal contributions. Experience details and contact information come from the supplied resume; the email also matches the plan. The resume is served unchanged from `public/resume.pdf`. Its download action is included only when that file exists at build time. The three project repositories, GitHub profile, LinkedIn profile, and Tranquility Base demo were checked on November 21, 2026; the demo returned HTTP 200. Keep claims and links current before publishing.

## Phase 5 observatory

`src/world/Observatory.tsx` builds a cutaway room, telescope, and exit from primitive geometry. `src/world/interactions.ts` declares town and interior anchors. `src/App.tsx` fades between scenes, resets player and camera to safe spawn points, and skips the fade for reduced motion. `src/ui/ProjectDialog.tsx` gives the telescope panel a lunar backdrop and reads its verified demo and GitHub links from `src/data/portfolio.ts`. An asset error boundary supplies primitive fallbacks; interaction anchors remain usable if detail rendering fails. Timers, NPC dialogue, quests, and backend services are not included.

## Phase 6 art and asset credits

The miniature kit consists of the character, clock tower, house module, town hall facade, notice board, post box, observatory dome and telescope, evergreen trees, and lanterns. All meshes and materials are original, authored in this repository with React Three Fiber and Three.js primitives; no third-party model, texture, or audio is used. The exported `public/models/town.glb` and `public/models/observatory.glb` contain this original geometry and have no third-party attribution obligation; use and modification follow the repository's terms. The character remains an original code-native model so its subtle walking bob can run independently. `src/world/palette.ts` keeps cream stone, roof purple, muted green, warm gold, deep blue, and steel blue consistent. All decorative geometry begins at the approved ground plane; colliders and interaction anchors remain in their original data files. `BatchedStaticKit` merges stationary town meshes by material and shadow behavior before export.

Town and observatory GLBs load on demand within the canvas with predictable scene origins and scale 1. Their Suspense fallbacks are simple landmark geometry, and asset errors show the same navigable fallbacks plus a visible status message. The direct HTML portfolio button remains available. Walking bob and faint star opacity motion stop for visitors who request reduced motion. Lighting stays fixed. The moon appears only after pressing E at the north lookout and hides on leaving it or entering the observatory. The clock is decorative.

### Editing and exporting world assets

Edit code geometry in `src/world/Town.tsx`, `ClockTower.tsx`, `Fountain.tsx`, `ObservatoryExterior.tsx`, and `ObservatoryInterior.tsx`. With `npm run dev`, preview source geometry at `/?asset-export=town` and `/?asset-export=observatory`; the ordinary `/` route loads the GLBs in `public/models/`. Run `npm run export:assets` after editing static geometry. This starts its own temporary Vite server and headless Edge or Chrome, exports both GLBs, checks landmark groups and the normal app's GLB load, then closes its browser and server. Set `TWILIGHT_BROWSER` to a browser executable if neither default location exists. Commit the updated source and both GLBs together. Run `npm run build` afterward to copy the GLBs into `dist/models/`.

`BatchedStaticKit` explicitly shares equivalent opaque, textureless basic or standard materials, then batches only meshes with the same material object and shadow settings within a named landmark. Textured, transparent, or custom shader materials stay separate. Named groups such as `ClockTower`, `Fountain`, `ObservatoryExterior`, `Telescope`, and `ExitFrame` remain in the GLBs as replacement points for future custom models. Fountain water is a live runtime layer in `WorldCanvas`, outside the town export. The moon is a runtime lookout reveal and is not part of either GLB. Source preview and the normal route both include the live water. A temporary magenta clock face was exported and observed in the normal app, then removed and exported again; this confirmed that source edits reach the runtime asset.

These models are code-built approximations of the supplied references: the clock tower has a simple faceted roof and face, the fountain has a compact stone basin and animated flat water, and the observatory uses a simple dome and cutaway room. The reference images' detailed masonry, sculpted fountain figure, telescope silhouette, stained glass, and moon facial features are not reproduced in this preparation phase.

### Fountain-reference style sample

`src/world/StyleSample.tsx` replaces the rear house beside the square with a rounded cream stone corner, individually beveled purple roof tiles, jointed pavers, and a flower planter. The nearby trees now have rounded overlapping canopies. The sample uses shared rough, nonmetallic materials and thin ground insets for contact shade. The grass no longer emits light; a warm directional key, soft hemisphere and opposite fill, and a low-intensity generated room reflection keep the fixed twilight scene readable. No bloom or depth-of-field effect is used.

Run `npm run dev` and open `/?preview=style-sample` to inspect the normal GLB at gameplay zoom near the sample. `npm run export:assets -- --screenshot=preview/style-sample.png --shadow-check` regenerates the assets and captures [the gameplay screenshot](preview/style-sample.png) plus [a second view after a short walk](preview/style-sample-moved.png) for comparing shadow edges. The reference's detailed stone carving, dense flowers, textured paving, and sculpted foliage remain approximations made from simple geometry and restrained color variation.

## Phase 6 measured performance

Measured November 21, 2026 at a 1440 x 900 browser viewport in headless Microsoft Edge with software WebGL (SwiftShader). Five-second samples after loading recorded **town: 68 draw calls, 9,274 triangles, 11.4 FPS** and **observatory: 71 draw calls, 5,113 triangles, 20.7 FPS**. After correcting ground shadows and the square surface, the town sample recorded **45 draw calls and 5,445 triangles**. The software renderer is slower than a normal GPU, so these FPS values are not laptop gameplay claims. Draw calls and triangles are below the plan's starting budgets of 150 and 100k–200k respectively. The town GLB is now **237,160 bytes** and the observatory GLB **106,604 bytes**; each is well below the 8 MB starting download budget. The Phase 6 model loader chunk was 21.11 KB gzip and its initial JS chunk was 320.49 KB gzip.

The measurement script is `node scripts/measure-phase6.mjs` or `node scripts/measure-phase6.mjs --observatory` against a local Vite dev server and an Edge remote debugging session on port 9222. It writes the screenshots in `preview/`; the scene also exposes its one-time five-second sample as `window.__twilightMetrics`. Phase 7 moves the Three.js runtime out of the initial bundle, so the Phase 6 initial bundle size above is historical. A hardware browser and phone review remain necessary before release.

## Phase 7 access and recovery

The town is the default view. A floating upper-right switch reaches the regular HTML portfolio; appending `?view=portfolio` to the site URL opens a direct portfolio route without downloading the world chunk or GLBs. The town introduction can be closed and reopened. There is no navigation header in town. A loading view always offers a View portfolio button. WebGL availability is checked before entering the world. A render or chunk failure shows a retry and a route back to the portfolio, and context loss replaces the world with that recovery view. Broken model requests retain navigable primitive landmarks. The world requires a keyboard; every section and link remains available in the HTML view on phones and tablets. Native project dialogs keep focus within the panel, close with Escape, and restore the prior focus. Scene fades, camera smoothing, player bob, and stars respect reduced motion. The favicon and page metadata are in `index.html` and `public/favicon.svg`.

The production smoke check (`node scripts/smoke-phase7.mjs` against `npm run preview` and headless Edge on port 9223) checks world-first arrival, the closeable guide, direct portfolio access without world requests, keyboard opening and closing of About, mobile access without horizontal overflow, reduced motion, and return to the portfolio when WebGL is unavailable. Build, lint, and seven collision/interaction tests pass.

The town GLB keeps the source meshes' shadow-casting choices, so flat terrain and paths receive shadows without casting their own. The square surface and rim sit above the joining paths at distinct heights. Town buildings cast shadows but do not sample shadows on their own walls and foundations, to avoid the camera-dependent shimmer at the rear houses. Collision and interaction coordinates did not change.

## Static deployment preparation

No server or rewrite rule is needed: publish the contents of `dist/` as a static site. For a site hosted at its domain root, run `npm ci`, `npm run lint`, `npm test`, and `npm run build`, then inspect it with `npm run preview`. If the host serves the site under a path such as `/portfolio/`, set `VITE_BASE_PATH=/portfolio/` for the build; model, resume, favicon, and generated chunk URLs use that base. Confirm that `dist/models/town.glb`, `dist/models/observatory.glb`, and, when present, `dist/resume.pdf` are included. After choosing a host, check the deployed URL for navigation, links, asset loading, and the observatory loop. No deployment has been made.
