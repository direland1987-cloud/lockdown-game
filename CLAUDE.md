# LOCKDOWN — Project Memory

## Project Overview
BJJ turn-based fighting game. Single self-contained HTML file (`lockdown-deploy/index.html`, ~1MB) using React 18.2 + Tailwind via CDN. Deployed to Vercel as static site (project: `lockdown_bjj`).

## Living Documents (ALWAYS update these after any changes)
- **`LOCKDOWN_BUILD_STATUS.md`** — Master build state: positions, moves, characters, artwork inventory, deployment info, bugfix log. Update whenever code changes are made.
- **`LOCKDOWN_TASK_LIST.md`** — Progressive task checklist. Mark items done, add new items, update status after every session.

These are living documents. Any code change, bugfix, new feature, artwork addition, or deployment should be reflected in both files before the session ends.

## Key Files
- `lockdown-deploy/index.html` — THE GAME (deploy this folder)
- `lockdown-deploy/*.mp3` — 9 audio files
- `Final Artwork/Accepted/` — Source artwork PNGs (not deployed, converted to base64 in HTML)
- `lockdown-characters.md` — Character descriptions for art generation prompts
- `lockdown-positions.md` — Position art generation prompts
- `lockdown-submissions.md` — Submission art generation prompts
- `lockdown-animation-framework.md` — CSS-only animation system reference
- `lockdown_v5_redesign.md` — v5 design rationale

## Deployment
- Vercel static site, free tier
- Deploy command: `cd lockdown-deploy && npx vercel --prod --yes`
- On Windows, may need: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` before running npx

## Architecture Notes
- All game code is inline in a single HTML file (no build step)
- Sprites are base64 WebP stored in SPRITE_DATA object
- Artwork (Marcus vs Adele) stored in ARTWORK_DATA object, checked first by getGrappleSprite()
- Adele uses her portrait artwork for all individual pose sprites (via initAdeleSprites)
- Head sprites generated procedurally via canvas in generateHeadSprites()
- Characters: marcus, adele, yuki (unlocked); darius, diego (locked)
