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

`src/world/Observatory.tsx` exposes the code-built interior kit. `src/world/interactions.ts` declares town and interior anchors. `src/App.tsx` fades between scenes, resets player and camera to safe spawn points, and skips the fade for reduced motion. `src/ui/ProjectDialog.tsx` gives the telescope panel a lunar backdrop and reads its verified demo and GitHub links from `src/data/portfolio.ts`. An asset error boundary supplies primitive fallbacks; interaction anchors remain usable if detail rendering fails. Timers, NPC dialogue, quests, and backend services are not included.

## Phase 6 art and asset credits

The miniature kit consists of the character, clock tower, house module, town hall facade, notice board, post box, observatory dome and telescope, evergreen trees, and lanterns. These town and observatory meshes and materials are original, authored in this repository with React Three Fiber and Three.js primitives. The exported `public/models/town.glb` and `public/models/observatory.glb` contain this original geometry. The lookout moon is a separate third-party asset credited below. The character remains an original code-native model so its subtle walking bob can run independently. `src/world/palette.ts` keeps cream stone, roof purple, muted green, warm gold, deep blue, and steel blue consistent. All decorative geometry begins at the approved ground plane; colliders and interaction anchors remain in their original data files. `BatchedStaticKit` merges stationary town meshes by material and shadow behavior before export.

Town and observatory GLBs load on demand within the canvas with predictable scene origins and scale 1. Their Suspense fallbacks are simple landmark geometry, and asset errors show the same navigable fallbacks plus a visible status message. The direct HTML portfolio button remains available. Walking bob and faint star opacity motion stop for visitors who request reduced motion. Lighting stays fixed. Press E at the north lookout to enter a stationary moon view; Escape or Return to town restores exploration. The clock is decorative.

### Editing and exporting world assets

Edit code geometry in `src/world/Town.tsx`, `ClockTower.tsx`, `Fountain.tsx`, `ObservatoryExterior.tsx`, and `ObservatoryInterior.tsx`. With `npm run dev`, preview source geometry at `/?asset-export=town` and `/?asset-export=observatory`; the ordinary `/` route loads the GLBs in `public/models/`. Run `npm run export:assets` after editing static geometry. This starts its own temporary Vite server and headless Edge or Chrome, exports both GLBs, checks landmark groups and the normal app's GLB load, then closes its browser and server. Set `TWILIGHT_BROWSER` to a browser executable if neither default location exists. Commit the updated source and both GLBs together. Run `npm run build` afterward to copy the GLBs into `dist/models/`.

`BatchedStaticKit` explicitly shares equivalent opaque, textureless basic or standard materials, then batches only meshes with the same material object and shadow settings within a named landmark. Textured, transparent, or custom shader materials stay separate. Named groups such as `ClockTower`, `Fountain`, `ObservatoryExterior`, `Telescope`, and `InteriorStarDome` remain in the GLBs as replacement points for future custom models. Fountain water is a live runtime layer in `WorldCanvas`, outside the town export. The moon is a runtime lookout reveal and is not part of either GLB. Source preview and the normal route both include the live water. A temporary magenta clock face was exported and observed in the normal app, then removed and exported again; this confirmed that source edits reach the runtime asset.

The code-built town and observatory models approximate the supplied references. Their detailed masonry, sculpted fountain figure, and refractive stained glass are simplified. The code-built fallback moon remains an approximation of the moon reference.

### Surrounding scenery and character

`TownScenery.tsx` builds rounded, clustered trees with visible trunks, small shrubs, and edged flower beds. Its repeated leaves, flowers, stones, and finishes share geometry and materials, and `BatchedStaticKit` merges compatible static meshes within the `TownScenery` group for export. `TownBuilding.tsx` refines the existing town hall with a rounded foundation, thick tiled gable roof, framed windows, and a rounded door. The two houses removed earlier remain absent. The flower beds and hall foundation have matching footprints in `collision.ts`; the plaza routes and observatory entrance remain open. `Player.tsx` keeps the existing ground footprint and identity while adding a larger face, rounded hands and boots, clearer clothing, and a small walking swing that stops for reduced motion.

The paired normal-runtime captures use identical 1440 × 900 camera positions: [plaza before](preview/scenery-before-plaza.png) and [after](preview/scenery-after-plaza.png); [observatory approach before](preview/scenery-before-observatory.png) and [after](preview/scenery-after-observatory.png). The greenery and flower shapes remain deliberately simple at gameplay zoom rather than using detailed foliage textures.

### Northern lookout and moon

`Town.tsx` builds the stone-framed terrace west of the clock tower near the north edge of the map. Its side walls have matching footprints in `collision.ts`, and the E anchor is on the flat, reachable center of the terrace. The terrace is exported in `town.glb` as `NorthLookout`. The user-provided [`majoras-moon.glb`](public/models/majoras-moon.glb) is ["The Legend Of Zelda Majoras Mask 3D - Moon" by Warrior364](https://sketchfab.com/3d-models/the-legend-of-zelda-majoras-mask-3d-moon-062f9773cb5b43338a60780e1e61c4bc), offered by its uploader under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The lookout UI also credits the author and license. The supplied original OBJ package and converted GLB both use a 256-pixel color texture; the GLB is the runtime asset.

`SketchfabMoon.tsx` centers, scales, tilts, and darkens the GLB at runtime and turns off its emissive layer; the supplied GLB file itself is unchanged. It stays outside the static town export. `LookoutMoon.tsx` is the original generated-geometry fallback if the GLB fails to load; its `moonFace` parameters remain editable. The moon exists only in lookout mode, so replacing its GLB does not change movement or interactions. `LookoutHorizon.tsx` adds a small dark landscape silhouette to tie the miniature foreground to the twilight sky.

`FollowCamera.tsx` owns the camera for exploration, the interior, and lookout mode. The lookout camera pans slowly toward a centered moon and frames the terrace and character; reduced motion switches instantly. During the shot, `ModelAsset.tsx` shows only the `NorthLookout` group from the town GLB, hiding the observatory, trees, and other town scenery. Movement and E interactions pause; held movement keys clear, and returning requires a fresh E press. The site footer appears in the portfolio but is hidden throughout Explore town. The [approach](preview/lookout-entry.png), [GLB moon view](preview/lookout-moon-mesh.png), [mobile view](preview/lookout-moon-mobile.png), [generated fallback](preview/lookout-moon-fallback.png), and [restored camera](preview/lookout-return.png) were captured from the normal GLB-loaded app at gameplay zoom. The moon does not approach, cast a town-wide shadow, trigger a timer, or reset the world.

### Fountain-reference style sample (archived)

`src/world/StyleSample.tsx` retains the earlier rounded cream stone corner, beveled purple roof tiles, jointed pavers, and flower planter as source geometry, but the house is no longer placed in town. The nearby trees still have rounded overlapping canopies. The grass no longer emits light; a warm directional key, soft hemisphere and opposite fill, and a low-intensity generated room reflection keep the fixed twilight scene readable. No bloom or depth-of-field effect is used.

The earlier [gameplay screenshot](preview/style-sample.png) and [movement screenshot](preview/style-sample-moved.png) document that sample before its removal from town. The reference's detailed stone carving, dense flowers, textured paving, and sculpted foliage were approximations made from simple geometry and restrained color variation.

### Central square

`ClockTower.tsx` places a stepped cream-stone tower at the north edge of the square, with a large ringed decorative face, radial markings, side walls, and a central door. `Fountain.tsx` places a segmented basin, upper bowl, and a code-built winged Hyrule-inspired crest in the foreground. Its live blue water, streams, and ripples remain outside the static town export. `Town.tsx` builds the paved radial surround and positions the planters near its edge. All steps and raised stonework are decorative; movement remains flat X/Z. `collision.ts` and `interactions.ts` keep the basin solid, the About prompt on open ground, and clear side routes around the fountain. The town camera frames both landmarks on arrival. [Normal runtime capture](preview/fountain-hyrule-crest.png) was taken from the exported GLB after closing the guide.

### Observatory exterior

`ObservatoryExterior.tsx` builds the low polygonal base, brass trim, small entrance, triangular dome, and angled telescope as separate named groups. `observatoryDome.ts` supplies one triangle topology for the inset blue and purple panels and their dark ribs, so the frame follows the shell. The curved telescope support is code geometry. These static groups export inside `town.glb`; the interior remains in `observatory.glb`. Edit the source, run `npm run export:assets`, and inspect the ordinary `/` route to see the GLB used by visitors. `/?preview=observatory-exterior` starts close to the entrance for gameplay zoom inspection. The export script checks the dome, door, and telescope groups in the GLB as future replacement points.

[Before](preview/observatory-baseline-close.png) and [after](preview/observatory-exterior-close.png) captures show the exterior at gameplay zoom; the [town arrival](preview/observatory-after-town.png) shows the full silhouette in context. These were taken with Playwright against the normal GLB-loaded app. The panels use reflective standard materials rather than refraction. Their smooth colors, the simple lens, and the curved mechanical support approximate the detailed glass and metalwork in the reference.

### Observatory interior

`ObservatoryInterior.tsx` assembles a decorative floor, central crystal exhibit, warm sconces, exit, and substantial telescope. `InteriorStarDome.tsx` builds opaque triangular purple, blue, and cyan panels with aligned structural ribs and tiled lower walls. Its star and nebula textures are generated deterministically on a canvas and embedded in `observatory.glb`; they do not reuse the reference image. `InteriorTelescope.tsx` keeps the barrel, support, and eyepiece in named groups for future replacement. The display is decorative; the existing project panel remains at the eyepiece.

`interiorCamera.ts` defines the lower interior view and limits follow to a small translation while keeping its orientation fixed and its position outside the enclosure. The camera looks through the front aperture; only the necessary foreground wall and roof sections are omitted. Movement stays aligned with the town controls. The exporter checks named interior groups and loads `observatory.glb` through the normal application. [Before](preview/interior-baseline.png), [runtime after](preview/interior-runtime.png), and [eyepiece approach](preview/interior-eyepiece.png) captures are at gameplay zoom. The reference's dense star field, intricate instrument mechanisms, and glass depth are simplified into generated textures and opaque geometry.

## Phase 6 measured performance

Measured November 21, 2026 at a 1440 x 900 browser viewport in headless Microsoft Edge with software WebGL (SwiftShader). Five-second samples after loading recorded **town: 68 draw calls, 9,274 triangles, 11.4 FPS** and **observatory: 71 draw calls, 5,113 triangles, 20.7 FPS**. After correcting ground shadows and the square surface, the town sample recorded **45 draw calls and 5,445 triangles**. The software renderer is slower than a normal GPU, so these FPS values are not laptop gameplay claims. Draw calls and triangles are below the plan's starting budgets of 150 and 100k–200k respectively. The town GLB is now **237,160 bytes** and the observatory GLB **106,604 bytes**; each is well below the 8 MB starting download budget. The Phase 6 model loader chunk was 21.11 KB gzip and its initial JS chunk was 320.49 KB gzip.

The measurement script is `node scripts/measure-phase6.mjs` or `node scripts/measure-phase6.mjs --observatory` against a local Vite dev server and an Edge remote debugging session on port 9222. It writes the screenshots in `preview/`; the scene also exposes its one-time five-second sample as `window.__twilightMetrics`. Phase 7 moves the Three.js runtime out of the initial bundle, so the Phase 6 initial bundle size above is historical. A hardware browser and phone review remain necessary before release.

## Phase 7 access and recovery

The town is the default view. A floating upper-right switch reaches the regular HTML portfolio; appending `?view=portfolio` to the site URL opens a direct portfolio route without downloading the world chunk or GLBs. The town introduction can be closed and reopened. There is no navigation header in town. A loading view always offers a View portfolio button. WebGL availability is checked before entering the world. A render or chunk failure shows a retry and a route back to the portfolio, and context loss replaces the world with that recovery view. Broken model requests retain navigable primitive landmarks. The world requires a keyboard; every section and link remains available in the HTML view on phones and tablets. Native project dialogs keep focus within the panel, close with Escape, and restore the prior focus. Scene fades, camera smoothing, player bob, and stars respect reduced motion. The favicon and page metadata are in `index.html` and `public/favicon.svg`.

The production smoke check (`node scripts/smoke-phase7.mjs` against `npm run preview` and headless Edge on port 9223) checks world-first arrival, the closeable guide, direct portfolio access without world requests, keyboard opening and closing of About, mobile access without horizontal overflow, reduced motion, and return to the portfolio when WebGL is unavailable. Build, lint, and seven collision/interaction tests pass.

The town GLB keeps the source meshes' shadow-casting choices, so flat terrain and paths receive shadows without casting their own. The square surface and rim sit above the joining paths at distinct heights. Town buildings cast shadows but do not sample shadows on their own walls and foundations, to avoid the camera-dependent shimmer at the rear houses. Collision and interaction coordinates did not change.

## Static deployment preparation

No server or rewrite rule is needed: publish the contents of `dist/` as a static site. For a site hosted at its domain root, run `npm ci`, `npm run lint`, `npm test`, and `npm run build`, then inspect it with `npm run preview`. If the host serves the site under a path such as `/portfolio/`, set `VITE_BASE_PATH=/portfolio/` for the build; model, resume, favicon, and generated chunk URLs use that base. Confirm that `dist/models/town.glb`, `dist/models/observatory.glb`, and, when present, `dist/resume.pdf` are included. After choosing a host, check the deployed URL for navigation, links, asset loading, and the observatory loop. No deployment has been made.
