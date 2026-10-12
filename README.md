# Thornwake: The Sunken Weald

A complete small solo action RPG built with Three.js and vanilla JavaScript. Explore a misty procedural forest, kindle three guarded shrines, and defeat the Crownless Keeper. A run takes roughly 5–10 minutes.

## Run

Requires Node.js 20.19+ or 22.12+.

    npm install
    npm run dev

Open the local URL printed by Vite. To package: `npm run build`. Serve the `dist` folder with any static HTTP server, or use `npm run preview`. The production build has no network dependency, fonts, textures, models, or audio downloads. Relative paths support subdirectory hosting. Open over HTTP, not by double-clicking HTML.

## Controls

- WASD or arrows: camera-relative movement
- J or left click: sword attack; softly targets a nearby enemy
- K or right mouse: hold frontal guard
- Space: dodge with a short invulnerability window
- Q: drink a healing elixir (three charges)
- E: kindle a nearby shrine after clearing its guardians
- Shift + left drag or middle drag: orbit camera; wheel: zoom
- Escape: pause/resume
- Touch devices: directional and action buttons
- Standard gamepad: left stick move, right stick orbit, X strike, LT guard, A dodge, B heal, Y commune, Start pause

Guard and attacks use stamina. Read the expanding ground rings and raised blades; evade or guard the strike and counter during recovery. Every three defeated sentinels increases blade damage and restores some health. Each shrine fully replenishes health, stamina, and elixirs. All three unlock the northern boss. Defeat or victory offers a fresh run. No persistent save.

## Implementation

Seeded procedural geometry; instanced trees, canopy, rocks, grass, ferns and paths; articulated plate-armored knight with optional thorn antlers and a leaf-emblem shield; synthesized audio; additive light shafts approximating volumetric rays; a subtle lighting cycle and translucent stream. Fixed 60 Hz simulation, capped rendering pixel ratio, low-graphics option, pause on focus loss, minimap and quest feedback.

The core build is approximately 550 KB uncompressed / 146 KB gzip, including Three.js. `node_modules` contains build tooling and is not shipped. The forest is deliberately stylized. Desktop is the primary target; touch/gamepad mappings are included but physical-device performance is not certified.

## Verification

`npm test` exercises stamina constraints, directional damage, dodge immunity, sword reach, movement, sentinel combat, all three shrine activations, boss victory, defeat and reset. The integration harness uses the actual scene and simulation with a mocked renderer, and restores health/stamina during encounters to isolate progression from player skill. Visual checks use the live browser. Add `?dev=1` for draw counts and frame-rate diagnostics.

## Repository structure

- `src/main.js`: procedural world, character animation, input, audio and game loop
- `src/rules.js`: combat rules and player configuration
- `src/style.css` and `index.html`: menus, HUD and responsive controls
- `tests/`: combat and full-loop simulation checks
- `design/`: procedural asset manifest and visual direction

## License

The game source is licensed under the [MIT License](LICENSE), permitting use, modification and redistribution with the copyright and license notice preserved. Three.js and Vite are separate dependencies under their respective licenses.
