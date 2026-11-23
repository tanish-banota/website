# Twilight Town portfolio

A portfolio that opens in a small, explorable 3D town. Walk to a landmark to open portfolio content, enter the observatory to use its telescope, or visit the northern lookout to see the moon. The regular HTML portfolio is always available through **View portfolio**.

The town stays at twilight. The clock is decorative; there is no countdown, day cycle, quest, or reset.

## Start the project

Use Node.js 22.20.0 or a compatible current Node 22 release.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The `/` route opens the town. Add `?view=portfolio` to open the HTML portfolio directly without loading the 3D world.

```sh
npm run build
npm run preview
```

`npm run build` creates the static site in `dist/`. The build includes the models and `public/resume.pdf`.

## Explore the town

| Action | Control |
| --- | --- |
| Move | WASD or arrow keys |
| Use a nearby landmark | E when its prompt appears |
| Close a project panel | Escape or its close button |
| Leave the moon lookout | Escape or **Return to town** |
| Switch to the HTML portfolio | **View portfolio** in the upper right |

The town guide can be closed and reopened with **Show town guide**. Once dismissed, it stays closed on later town visits until reopened. Project dialogs manage focus, and movement keys clear when a panel, scene transition, or lookout view takes control. Reduced-motion preferences shorten or remove camera, scene, star, and walking animation.

The player starts at the southern entrance. The observatory door, telescope eyepiece, and exit form a repeatable loop. The northern lookout is beyond the clock tower near the top edge of the exterior map; the faced moon loads only after pressing E there. During that view, the player and terrace remain visible while the other town scenery is hidden. Town movement is flat X/Z, so steps and raised details are decorative. The fountain basin and substantial props have collision footprints, with walkable routes around them.

## How the project developed

| Phase | What it added |
| --- | --- |
| 1. Foundation | The HTML portfolio, world-first entry, view switch, character movement, and keyboard interactions. |
| 2. Miniature style | Rounded cream stone, roof tiles, paving, flowers, soft lighting, and the fixed twilight palette. The archived [style sample](preview/style-sample.png) records this pass. |
| 3. Central square | The decorative clock tower, circular fountain, paved plaza, planters, and clear routes around the basin. |
| 4. Observatory exterior | A low blue faceted dome, triangular panels and ribs, a telescope silhouette, and a reachable entrance. |
| 5. Observatory interior | A star-panel dome, tiled walls, telescope and eyepiece, crystal display, and a lower camera with constrained follow. |
| 6. Assets and rendering | Code geometry exported as GLBs, compatible material batching, lighting and shadow work, and runtime asset checks. |
| 7. Access and recovery | Direct portfolio access, persistent guide dismissal, accessible panels, reduced motion, and fallbacks for WebGL or model failures. |

Later passes added the E-triggered moon lookout, fuller trees and gardens, the refined town hall and player, a closer bounded exterior camera, and a production review. The exterior composition pass added a broken stone boundary behind the clock, planted side edges, and a flat southern entrance. The two houses removed earlier remain absent.

The scenery composition pass grouped the observatory's cool flower garden, the notice-board bench and lantern, broken planted plaza borders, a sheltered town-hall entrance, and small southern entrance plantings. Trees now use deterministic size, lean, and rotation variants with overlapping canopies and earth-toned bases. The fountain and main routes remain open.

## Where to make changes

| Change | Main files |
| --- | --- |
| Portfolio text, links, projects, experience, contact | `src/data/portfolio.ts` |
| Town layout and static landmarks | `src/world/Town.tsx`, `ClockTower.tsx`, `Fountain.tsx`, `ObservatoryExterior.tsx` |
| Trees, gardens, town hall | `src/world/TownScenery.tsx`, `TownBuilding.tsx` |
| Exterior boundary layout and entrance | `src/world/TownBoundary.tsx`, `townBoundaryLayout.ts`, `collision.ts` |
| Observatory room | `src/world/ObservatoryInterior.tsx`, `InteriorStarDome.tsx`, `InteriorTelescope.tsx` |
| Player appearance and walking motion | `src/world/Player.tsx` |
| Collision and interaction locations | `src/world/collision.ts`, `interactions.ts` |
| Camera presets and scene behavior | `src/world/FollowCamera.tsx`, `interiorCamera.ts`, `WorldExperience.tsx` |
| Lighting and runtime-only water and moon | `src/world/WorldCanvas.tsx`, `Fountain.tsx`, `SketchfabMoon.tsx`, `LookoutMoon.tsx` |

`public/resume.pdf` is served as provided. The resume download appears only when the file exists at build time. Check portfolio claims and external links before publishing.

The core palette is in `src/world/palette.ts`: sky `#29213F`, roofs `#665087`, terrain `#68765A`, windows `#EDBC70`, deep blue `#263750`, steel blue `#627D93`, and cream stone `#F3EBDD`.

## Edit, export, and check 3D assets

The source geometry is built in code. **The ordinary application loads exported GLBs**, so a source edit will not appear there until the assets are regenerated.

1. Run `npm run dev`. Use `/?asset-export=town` or `/?asset-export=observatory` to inspect source geometry. The ordinary `/` route loads `public/models/town.glb`; `/?preview=observatory` loads `public/models/observatory.glb` in development. Other development preview positions include `?preview=observatory-exterior` and `?preview=lookout`.
2. Run `npm run export:assets` after editing static geometry. The script starts its own local Vite server and headless Edge or Chrome, regenerates **both** GLBs, checks their named groups and shadow settings, and verifies that the normal app loads them. It does not require an existing browser debugging session. Set `TWILIGHT_BROWSER` to a browser executable if neither default Windows path applies.
3. Run `npm run build` to copy the exported files into `dist/models/`. Keep source changes and their regenerated GLBs together.
4. Run `npm run review:production` to exercise the built site, compare source and GLB views, capture screenshots, and write [the review data](preview/production-review.json). This also starts its own temporary browser and local servers. Build first; the review script does not build for you.

`BatchedStaticKit.tsx` batches compatible stationary meshes within named landmarks. It shares only equivalent opaque materials and keeps textured, transparent, or custom shader materials separate. The exporter records each mesh's shadow choices in glTF extras; `ModelAsset.tsx` restores them when loading the GLB. Groups such as `ClockTower`, `Fountain`, `NorthLookout`, `ObservatoryExterior`, `Telescope`, and `InteriorStarDome` remain named for later model replacement.

Fountain water, falling streams, and ripples are animated at runtime, outside `town.glb`. The moon is also a separate runtime reveal and is absent from both static exports. The observatory star and nebula textures are generated in code and embedded in `observatory.glb`. Static town and interior materials are opaque; translucent water uses depth writing disabled. The supplied `public/models/majoras-moon.glb` is **not** regenerated by `export:assets`.

## Checks and current captures

```sh
npm run lint
npm test
npm run build
npm run review:production
```

The unit tests cover movement, fountain and landmark reachability, observatory spawns, the interior camera, and dome topology. The production review checks world-first arrival and portfolio access; three observatory entry/exit loops and the telescope panel; lookout entry, Escape and button exit, input clearing, and camera return; reduced motion; and town, moon, and WebGL failure recovery. It also checks that the moon and water appear only in their intended scenes and that source and loaded GLBs retain the same mesh shadow settings.

| View | Normal runtime capture |
| --- | --- |
| Central square | [Square](preview/review-square.png) |
| Observatory exterior | [Exterior](preview/review-observatory-exterior.png) |
| Observatory interior | [Interior](preview/review-observatory-interior.png) |
| Moon lookout | [Lookout](preview/review-lookout.png) |
| Same location after returning | [Returned to town](preview/review-lookout-return.png) |

For direct comparisons, see [town source](preview/review-town-source.png) and [loaded town GLB](preview/review-town-runtime.png), plus [interior source](preview/review-interior-source.png) and [loaded interior GLB](preview/review-interior-runtime.png). The [moving shadow capture](preview/review-shadow-motion.png) shows the plaza after a short walk. Earlier [plaza](preview/scenery-before-plaza.png) and [observatory approach](preview/scenery-before-observatory.png) captures can be compared with the [updated plaza](preview/scenery-after-plaza.png) and [updated approach](preview/scenery-after-observatory.png).

The exterior composition comparison is in `preview/camera-pass/`: `environment-baseline` and `environment-final` capture the square, observatory approach, eastern and southern edges, and northern lookout at 1440 x 900 and 390 x 844. Their JSON files record the player position and camera state for each view.

The later `relocation-baseline` and `relocation-final` captures record the entrance spawn, the wall behind the clock, and the lookout before and after moving it farther north at those same viewport sizes.

The `scenery-composition-baseline` and `scenery-composition-final` captures record this pass at the same player positions and 1440 × 900 and 390 × 844 viewports. Both use the normal GLB runtime; the JSON files contain the player and render states.

### Latest measured performance

The November 23, 2026 review used a 1440 × 900 headless Edge 158 viewport with hardware accelerated D3D11 on an Intel Arc 140V GPU. Five-second samples began after the GLBs loaded.

| Scene | FPS | Draw calls | Triangles |
| --- | ---: | ---: | ---: |
| Town entrance | 58.6 | 267 | 175,916 |
| Observatory interior | 60.1 | 111 | 15,916 |

The browser was capped near 60 FPS. These numbers describe this hardware, not a lower-end-device prediction. At the same entrance position, the scenery pass increased draw calls from 246 to 267 while reducing visible triangles from 182,240 to 175,916. The town exceeds the earlier 150-draw-call starting target and should be measured on slower GPUs before further scenery expansion.

| Runtime asset | Size |
| --- | ---: |
| `town.glb` | 5.00 MB |
| `observatory.glb` | 0.62 MB |
| `majoras-moon.glb` | 0.19 MB |

The static GLBs contain no transparent materials. No shadow acne was visible in the captured views; a longer interactive session is still needed to rule out temporal shimmer. The older SwiftShader measurements in `scripts/measure-phase6.mjs` are historical software-renderer results, not evidence of hardware performance.

## Art, credit, and remaining approximations

The town, observatory, character, scenery, and generated fallback moon are original code geometry in this repository. The supplied runtime moon, [`majoras-moon.glb`](public/models/majoras-moon.glb), is [“The Legend Of Zelda Majoras Mask 3D - Moon” by Warrior364](https://sketchfab.com/3d-models/the-legend-of-zelda-majoras-mask-3d-moon-062f9773cb5b43338a60780e1e61c4bc), shared under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The lookout UI also credits the author. Its color texture is 256 pixels wide.

Masonry, roof tiles, foliage, the fountain crest, the telescope mechanism, and the star panels use stylized geometry or generated textures. There is no refractive glass, bloom, or depth-of-field effect. The strongest future custom-model candidates are a higher-detail original faced moon, sculpted clock tower and fountain details, and a more intricate observatory telescope. Keep their interaction anchors, collision footprints, and named GLB groups when replacing them.

## Deployment preparation

The site is static. Publish the contents of `dist/` to a static host after running the checks above; no server rewrite rule is needed. For hosting below a path such as `/portfolio/`, build with `VITE_BASE_PATH=/portfolio/` so model, resume, favicon, and chunk URLs use that base. Confirm `dist/models/` and `dist/resume.pdf` are included, then test the published URL and its observatory loop. **No deployment has been made.**
