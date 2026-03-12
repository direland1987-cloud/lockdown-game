# LOCKDOWN — Master Plan v2.0

> **Date:** March 2026
> **Platform:** iOS first (Capacitor shell), web fallback
> **Roster:** 3 heroes (Marcus, Adele, Yuki) + 8 goons for campaign
> **Status:** Arcade mode playable. Campaign mode, stamina overhaul, and goon system are next.

---

## Document Index

| Doc | Contents | Audience |
|-----|----------|----------|
| `01_GAMEPLAY_AND_MECHANICS.md` | Campaign structure, stamina overhaul, 4-move limit, difficulty, minigames, side-scrollers, retention loops | Claude Code (implementation) |
| `02_ARTWORK_AND_STYLE.md` | Complete artwork inventory (done vs needed), goon character system, sprite specs, art pipeline | Art generation (ChatGPT/PixelLab/Gemini) + Claude Code (integration) |
| `03_MONETIZATION.md` | Ads (rewarded video), IAP (remove ads + skip token), iOS ad SDK, revenue projections | Claude Code (integration) + App Store submission |
| `04_IOS_BUILD_AND_DEPLOYMENT.md` | Capacitor wrapper, App Store requirements, build pipeline, audio/ad SDK integration | Claude Code (build setup) |

---

## Guiding Principles

1. **Sticky over deep.** Daily return loops (challenges, streaks, mini-games) matter more than 40-hour campaign length. Players should want to open the app every day.
2. **High-powered, fast fights.** The current minigame system is too many steps and too hard. Simplify: fewer combo steps, bigger impact per move, more dramatic stamina swings.
3. **Stamina is the game.** Stamina isn't a background stat — it's THE strategic resource. Every move choice is a stamina trade-off. Make it visible, animated, and consequential.
4. **Goons before bosses.** Campaign opponents are 8 procedurally-generated goon archetypes with standing sprites and faces only. Save the expensive combined grapple art for hero vs hero (boss fights + arcade mode).
5. **Ship the 3-character campaign first.** The architecture supports 8 characters, but launch with Marcus/Adele/Yuki as heroes and the 8 goons as campaign opponents.
6. **iOS first.** Build with Capacitor, test on iPhone, submit to App Store. Web/Android are secondary deployment targets.

---

## Execution Phases

### Phase 1 — Core Systems (Weeks 1–2)
- [ ] Stamina overhaul (see `01_GAMEPLAY_AND_MECHANICS.md` §2)
- [ ] 4-move-per-position equip/forget system (§3)
- [ ] XP and leveling system (§4)
- [ ] Minigame simplification — fewer steps, bigger payoffs (§6)
- [ ] Stamina bar visual upgrade — animated, attention-grabbing (§2.4)

### Phase 2 — Campaign & Goons (Weeks 3–4)
- [ ] 8 goon character definitions + procedural sprites (see `02_ARTWORK_AND_STYLE.md` §3)
- [ ] Campaign chapter structure — 6 chapters, progressive unlocks (§5)
- [ ] AI difficulty scaling across 5 dimensions (§7)
- [ ] Training Mode (free practice sandbox)

### Phase 3 — Mini-Games & Side-Scrollers (Weeks 5–6)
- [ ] Side-scroller engine (one-thumb, 30–60 sec max) (§8)
- [ ] 6 comedy mini-games (§9)
- [ ] Integration into campaign chapter flow

### Phase 4 — Monetization & iOS Build (Weeks 7–8)
- [ ] Capacitor iOS wrapper (see `04_IOS_BUILD_AND_DEPLOYMENT.md`)
- [ ] Rewarded video ad SDK integration (see `03_MONETIZATION.md`)
- [ ] IAP: Remove Ads + Skip Side-Scroller Token
- [ ] Daily challenge system + streak tracker
- [ ] App Store submission prep (screenshots, metadata, review compliance)

### Phase 5 — Polish & Ship (Week 9+)
- [ ] Complete Adele individual sprites (Tier 1: 9 critical poses)
- [ ] Remaining hero artwork (submission technique shots, Marcus vs Yuki pair)
- [ ] Full iPhone testing pass (existing bug fix plan)
- [ ] Soft launch → iterate → public launch

---

## Current State Summary

**What works now:**
- 3 playable heroes (Marcus has full art, Adele uses portrait placeholder, Yuki has procedural sprites)
- 10 positions including Ashi Garami
- 114 moves across all positions
- 4 minigame types (sequence, power, timing, tap)
- Marcus vs Adele: 19 hand-drawn CPS2 grapple sprites + 6 face portraits
- 5 animated arena backgrounds
- Submission cutscene system
- Howler.js audio (6 music tracks + SFX)
- Deployed on Vercel

**What's broken or missing:**
- Stamina system is invisible and inconsequential — needs full overhaul
- Too many moves per position (6–8) — overwhelming on mobile
- Minigames too hard and too many steps — needs simplification
- Adele has 0 real individual sprites (portrait used for all 24 poses)
- No campaign mode
- No daily retention loops
- No monetization
- No iOS app wrapper
- Submission artwork display system not built
- Yuki artwork not wired into game code

---

*Each sub-document is self-contained and can be handed directly to Claude Code for implementation.*
