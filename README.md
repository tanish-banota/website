# Twilight Town portfolio — Phase 5

A static portfolio with a compact 3D town. The portfolio remains the default view. The placeholder character can walk to town landmarks, enter the observatory, use its telescope to read the Tranquility Base panel, and exit back to town.

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

`src/world/Observatory.tsx` builds a cutaway room, telescope, and exit from primitive geometry. `src/world/interactions.ts` declares town and interior anchors. `src/App.tsx` fades between scenes, resets player and camera to safe spawn points, and skips the fade for reduced motion. `src/ui/ProjectDialog.tsx` gives the telescope panel a lunar backdrop and reads its verified demo and GitHub links from `src/data/portfolio.ts`. An interior error boundary supplies a primitive fallback; interaction anchors remain usable if detail rendering fails. Timers, NPC dialogue, quests, and backend services are not included.
