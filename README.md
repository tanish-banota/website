# Twilight Town portfolio — Phase 4

A static portfolio with a compact 3D town. The portfolio remains the default view. The placeholder character can walk to town landmarks and open shared portfolio content in HTML dialogs.

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

## Phase 4 interactions

`src/world/Town.tsx` uses primitive geometry for the flat map and landmarks. `src/world/Player.tsx` walks with WASD or arrow keys, while `src/world/collision.ts` keeps the character within the town and outside obstacles. `src/world/interactions.ts` declares scene-specific anchors for the clock square, notice board, town hall, and post box. The nearest one shows a single E prompt; `src/ui/ProjectDialog.tsx` uses a native modal dialog to show content from `src/data/portfolio.ts`. Movement pauses and held keys clear while a panel is open. The observatory interior and telescope interaction are reserved for Phase 5. Timers, NPC dialogue, quests, and backend services are not included.
