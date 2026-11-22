# Twilight Town portfolio — Phase 3

A static portfolio with a compact 3D town. The portfolio remains the default view. A placeholder character can walk around the town; landmarks do not have interactions yet.

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

## Phase 3 movement

`src/world/Town.tsx` uses primitive geometry for the flat map and landmarks. `src/world/Player.tsx` walks with WASD or arrow keys using delta time and normalized diagonals. `src/world/collision.ts` holds hand-authored footprints, ground bounds, and pure axis-separated movement. `src/world/useInput.ts` clears held keys on blur or view changes and ignores gameplay input in form controls and dialogs. `src/world/FollowCamera.tsx` tracks the player at a fixed elevated angle. Landmark interactions, interiors, timers, and backend services are not part of Phase 3.
