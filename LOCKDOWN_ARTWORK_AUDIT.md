# LOCKDOWN Artwork Audit

*Generated: 2026-03-12*

---

## Summary Dashboard

| Category | Exists | Missing/Placeholder | Old/Untracked Origin |
|----------|--------|---------------------|----------------------|
| Adele individual pose sprites | 0 real | **24 (all placeholder)** | — |
| Marcus individual pose sprites | 8 | 0 | **8 (old origin)** |
| Yuki individual pose sprites | 8 | 0 | **8 (old origin)** |
| Grapple template sprites | 25 embedded | 1 (grapple_turtle not embedded) | **26 on disk (old origin)** |
| ARTWORK_DATA (Marcus vs Adele) | 23 keys | 0 | 0 (all from Final Artwork) |
| Final Artwork files on disk | 46 files | — | — |
| Final Artwork files NOT in game | **15 files** | — | — |
| Raw sprites (archived) | 8 files | — | **8 (oldest origin)** |

**Bottom line:** Adele has zero real sprites (portrait used for all 24 poses). Marcus and Yuki each have 8 fighting sprites of unknown/untracked origin. All 25 grapple templates are also untracked.

---

## Adele: 24 Poses Needed

Adele's `initAdeleSprites()` function (line ~724) copies her portrait artwork (`artwork_adele_portrait`) into all 24 SPRITE_DATA slots. She needs actual fighting pose sprites for each.

**Target dimensions:** ~150-170px wide x ~180px tall (matching Marcus 144x179, Yuki 169x180)

### Tier 1 — Visible in ALL Fights (9 sprites)
These show in every match regardless of opponent:

| Pose Key | When Shown | Priority |
|----------|------------|----------|
| `adele_idle` | Default standing pose | Critical |
| `adele_idle2` | Alternate standing pose | Critical |
| `adele_win` | Victory screen | Critical |
| `adele_lose` | Defeat screen | Critical |
| `adele_hit` | Taking damage | Critical |
| `adele_tired` | Low stamina | High |
| `adele_effort` | Attempting move | High |
| `adele_tapOut` | Tapping out / submission loss | High |
| `adele_clinch` | Standing clinch position | High |

### Tier 2 — Visible in Non-Marcus Matchups (15 sprites)
These are hidden during Marcus vs Adele fights (ARTWORK_DATA grapple art takes priority via `getArtworkSprite()`). They show when Adele fights Yuki, Darius, Diego, or future characters.

| Pose Key | Position | Role |
|----------|----------|------|
| `adele_guardTop` | Closed Guard | Top player |
| `adele_guardBtm` | Closed Guard | Bottom player |
| `adele_mountTop` | Mount | Top player |
| `adele_mountBtm` | Mount | Bottom player |
| `adele_pressTop` | Side Control | Top player (pressing) |
| `adele_pinned` | Side Control | Bottom player (pinned) |
| `adele_backTop` | Back Control | Attacking back |
| `adele_backTaken` | Back Control | Back taken |
| `adele_openGuardTop` | Open Guard | Top player |
| `adele_openGuardBtm` | Open Guard | Bottom player |
| `adele_halfGuardTop` | Half Guard | Top player |
| `adele_halfGuardBtm` | Half Guard | Bottom player |
| `adele_spiderGuard` | Spider Guard | Guard player |
| `adele_ashiTop` | Ashi Garami | Attacking legs |
| `adele_ashiBtm` | Ashi Garami | Defending legs |

---

## Per-Character Sprite Inventory

### Marcus — 8 sprites (all old origin)

| SPRITE_DATA Key | Source | In Final Artwork? |
|-----------------|--------|-------------------|
| `marcus_idle` | `archived/lockdown-build/sprites_check/marcus_idle.webp` | No |
| `marcus_idle2` | `archived/lockdown-build/sprites_check/marcus_idle2.webp` | No |
| `marcus_win` | `archived/lockdown-build/sprites_check/marcus_win.webp` | No |
| `marcus_lose` | `archived/lockdown-build/sprites_check/marcus_lose.webp` | No |
| `marcus_hit` | `archived/lockdown-build/sprites_check/marcus_hit.webp` | No |
| `marcus_tired` | `archived/lockdown-build/sprites_check/marcus_tired.webp` | No |
| `marcus_effort` | `archived/lockdown-build/sprites_check/marcus_effort.webp` | No |
| `marcus_tapOut` | `archived/lockdown-build/sprites_check/marcus_tapOut.webp` | No |

**Status:** Working well visually. The Final Artwork folder has `Marcus.png` (full-body portrait) but NOT individual fighting pose sprites.

### Yuki — 8 sprites (all old origin)

| SPRITE_DATA Key | Source | In Final Artwork? |
|-----------------|--------|-------------------|
| `yuki_idle` | `archived/lockdown-build/sprites_check/yuki_idle.webp` | No |
| `yuki_idle2` | `archived/lockdown-build/sprites_check/yuki_idle2.webp` | No |
| `yuki_win` | `archived/lockdown-build/sprites_check/yuki_win.webp` | No |
| `yuki_lose` | `archived/lockdown-build/sprites_check/yuki_lose.webp` | No |
| `yuki_hit` | `archived/lockdown-build/sprites_check/yuki_hit.webp` | No |
| `yuki_tired` | `archived/lockdown-build/sprites_check/yuki_tired.webp` | No |
| `yuki_effort` | `archived/lockdown-build/sprites_check/yuki_effort.webp` | No |
| `yuki_tapOut` | `archived/lockdown-build/sprites_check/yuki_tapOut.webp` | No |

**Status:** Working well visually. The Final Artwork folder has `Yuki.png` (full-body portrait) but NOT individual fighting pose sprites.

### Adele — 0 real sprites (24 portrait placeholders)

| SPRITE_DATA Key | Actual Source | Real Sprite? |
|-----------------|---------------|--------------|
| `adele_idle` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_idle2` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_win` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_lose` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_hit` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_tired` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_effort` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_tapOut` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_clinch` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_guardTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_guardBtm` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_openGuardTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_openGuardBtm` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_halfGuardTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_halfGuardBtm` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_spiderGuard` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_mountTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_mountBtm` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_pressTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_pinned` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_backTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_backTaken` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_ashiTop` | `artwork_adele_portrait` copy | No — portrait placeholder |
| `adele_ashiBtm` | `artwork_adele_portrait` copy | No — portrait placeholder |

---

## ARTWORK_DATA Inventory (23 Keys)

All sourced from `Final Artwork/Accepted/`. These are the high-quality grapple illustrations used for Marcus vs Adele matchups.

### Ground Position Art (17 keys)

| ARTWORK_DATA Key | Source File | Position |
|------------------|------------|----------|
| `artwork_closedguard_marcus_top` | `Closed guard_Marcus_Adele.png` | Marcus top, Adele bottom |
| `artwork_closedguard_adele_top` | `Closed Guard_Adele_Marcus.png` | Adele top, Marcus bottom |
| `artwork_openguard_marcus_top` | `Open Guard_Marcus_Adele.png` | Marcus top, Adele bottom |
| `artwork_openguard_adele_top` | `Open Guard_Adele_Marcus.png` | Adele top, Marcus bottom |
| `artwork_butterflyguard_marcus_top` | `Butterfly Guard_Marcus_Adele.png` | Marcus top, Adele bottom |
| `artwork_butterflyguard_adele_top` | `Butterfly Guard_Adele_Marcus.png` | Adele top, Marcus bottom |
| `artwork_halfguard_marcus_top` | `Half Guard_Marcus_Adele.png` | Marcus top, Adele bottom |
| `artwork_halfguard_adele_top` | `Half Guard_Adele_Marcus.png` | Adele top, Marcus bottom |
| `artwork_sidecontrol_marcus_top` | `Side Control_Marcus_Adele.png` | Marcus pressing, Adele pinned |
| `artwork_sidecontrol_adele_top` | `Side Control_Adele_Marcus.png` | Adele pressing, Marcus pinned |
| `artwork_mount_marcus_top` | `Mount_Marcus_Adele.png` | Marcus mounted, Adele bottom |
| `artwork_mount_adele_top` | `Mount_Adele_Marcus.png` | Adele mounted, Marcus bottom |
| `artwork_backcontrol_marcus_top` | `Back control_Marcus_Adele.png` | Marcus has back |
| `artwork_backcontrol_adele_top` | `Back Control_Adele_Marcus.png` | Adele has back |
| `artwork_ashi_marcus_top` | `Ashi Garami_marcus_Adele.png` | Marcus attacking legs |
| `artwork_ashi_adele_top` | `Ashi Garami_Adele_Marcus.png` | Adele attacking legs |
| `artwork_clinch_marcus_adele` | `Clinch_Adele_Marcus.png` | Standing clinch (single image) |

### Portraits (2 keys)

| ARTWORK_DATA Key | Source File | Used For |
|------------------|------------|----------|
| `artwork_marcus_portrait` | `References/Characaters/Marcus.png` | Marcus character portrait |
| `artwork_adele_portrait` | `References/Characaters/Adele.png` | Adele portrait + all 24 pose placeholders |

### Face Expressions (4 keys)

| ARTWORK_DATA Key | Source File | Used For |
|------------------|------------|----------|
| `artwork_marcus_attack_face` | `References/Characaters/marcus face sheet.png` (cropped) | Attack/effort HUD expression |
| `artwork_marcus_defense_face` | `References/Characaters/marcus face sheet.png` (cropped) | Defense/tired HUD expression |
| `artwork_adele_attack_face` | `References/Characaters/Adele face sheet.png` (cropped) | Attack/effort HUD expression |
| `artwork_adele_defense_face` | `References/Characaters/Adele face sheet.png` (cropped) | Defense/tired HUD expression |

---

## Old/Unknown Origin Sprites

These sprites are embedded in `SPRITE_DATA` but are **NOT** sourced from the `Final Artwork/Accepted/` folder. They originate from `archived/lockdown-build/sprites_check/` (dated ~Feb 28, 2026).

### Marcus Fighting Poses — 8 sprites (old origin)
`marcus_idle`, `marcus_idle2`, `marcus_win`, `marcus_lose`, `marcus_hit`, `marcus_tired`, `marcus_effort`, `marcus_tapOut`

- Format: WebP, base64-embedded
- Visual quality: Good (user-confirmed working)
- No equivalent exists in Final Artwork (only full-body portrait `Marcus.png`)

### Yuki Fighting Poses — 8 sprites (old origin)
`yuki_idle`, `yuki_idle2`, `yuki_win`, `yuki_lose`, `yuki_hit`, `yuki_tired`, `yuki_effort`, `yuki_tapOut`

- Format: WebP, base64-embedded
- Visual quality: Good (user-confirmed working)
- No equivalent exists in Final Artwork (only full-body portrait `Yuki.png`)

### Grapple Templates — 25 embedded, 26 on disk (old origin)
All from `archived/lockdown-build/sprites_check/`. These are position-agnostic body templates that get head sprites composited on top and zone colors recolored per character.

**Embedded in SPRITE_DATA (25):**

| Position | Variants | Count |
|----------|----------|-------|
| Guard (Closed) | normal, big, small, rev | 4 |
| Mount | normal, big, small, rev | 4 |
| Back Control | normal, big, small, rev | 4 |
| Side Control | normal, big, small, rev | 4 |
| Half Guard | normal, big, small, rev | 4 |
| Open Guard | normal, rev | 2 |
| Clinch | normal, rev | 2 |
| Turtle | rev only | 1 |
| **Total** | | **25** |

**On disk but NOT embedded:**
- `grapple_turtle.webp` — exists in archived folder but missing from SPRITE_DATA (only `grapple_turtle_rev` is embedded)

### Raw Sprites — 8 files (oldest origin)
From `archived/lockdown-build/raw_sprites/`. These appear to be the earliest generation of position art, predating the WebP sprites. **Not embedded in the game.**

| File | Position Depicted |
|------|-------------------|
| `A1_closed_guard.png` | Closed Guard |
| `A2_open_guard.png` | Open Guard |
| `A3_half_guard.png` | Half Guard |
| `A4_side_control.png` | Side Control |
| `A5_mount.png` | Mount |
| `A6_back_mount.png` | Back Mount |
| `A7_turtle.png` | Turtle |
| `A8_standing_clinch.png` | Standing Clinch |

---

## Source Files on Disk NOT in Game

These files exist in `Final Artwork/Accepted/` but are **not embedded** in the game:

### Artwork That Could Be Added

| File | Why Not in Game |
|------|-----------------|
| `Turtle Marcus_adele.png` | No `artwork_turtle_marcus_top` key exists — **Turtle position artwork not implemented** |
| `Turtle Adele_Marcus.png` | No `artwork_turtle_adele_top` key exists — **Turtle position artwork not implemented** |
| `Marcus Sub Defend.png` | Submission artwork system not yet built |
| `Marcus Sub Attack.png` | Submission artwork system not yet built |
| `Adele Sub Attack.png` | Submission artwork system not yet built |
| `Adele Sub defend.png` | Submission artwork system not yet built |

### Reference/Source Material (not intended for embedding)

| File | Purpose |
|------|---------|
| `Yuki.png` | Yuki full-body portrait reference |
| `Yuki face sheet.png` | Yuki face expressions (no ARTWORK_DATA keys for Yuki yet) |
| `marcus face sheet.png` | Source for face crops (already embedded as 2 cropped keys) |
| `Adele face sheet.png` | Source for face crops (already embedded as 2 cropped keys) |
| `Reference half guard.png` | Art generation reference |
| `Reference mount.png` | Art generation reference |
| `Reference open guard.png` | Art generation reference |
| `Reference closed guard.png` | Art generation reference |
| `Reference back control.png` | Art generation reference |
| `reference side control.jpg` | Art generation reference |
| `reference turtle.jpg` | Art generation reference |
| `reference knee on belly.png` | Art generation reference |
| `reference north south.webp` | Art generation reference |
| `reference butterfly guard.webp` | Art generation reference |
| `reference ashi garami.jpg` | Art generation reference |

### Marcus vs Yuki Test Images (not implemented)

| File | Notes |
|------|-------|
| `ChatGPT Image Mar 8, 2026, 09_34_49 PM.png` | Test artwork for Marcus vs Yuki matchup |
| `ChatGPT Image Mar 8, 2026, 09_37_07 PM.png` | Test artwork for Marcus vs Yuki matchup |
| `ChatGPT Image Mar 8, 2026, 09_40_43 PM.png` | Test artwork for Marcus vs Yuki matchup |
| `ChatGPT Image Mar 8, 2026, 09_43_21 PM.png` | Test artwork for Marcus vs Yuki matchup |

### Prompt/Doc Files

| File | Purpose |
|------|---------|
| `lockdown-cowork-prompt.md` | AI artwork generation collaboration prompt |
| `lockdown-prompts-by-position.md` | Position-specific art prompts |

---

## Artwork Creation Priority List

Ordered by visual impact on the game:

### Priority 1 — Adele Fighting Sprites (Tier 1)
**Impact:** Every Adele fight currently shows her portrait for all poses. These 9 sprites fix the most visible issue.

1. `adele_idle` — Default standing pose (shown most often)
2. `adele_idle2` — Alternate idle
3. `adele_win` — Victory screen
4. `adele_lose` — Defeat screen
5. `adele_hit` — Taking damage
6. `adele_effort` — Attempting moves
7. `adele_tired` — Low stamina
8. `adele_tapOut` — Submission loss
9. `adele_clinch` — Standing clinch

### Priority 2 — Turtle Position Artwork
**Impact:** Turtle art files already exist on disk (`Turtle Marcus_adele.png`, `Turtle Adele_Marcus.png`) but aren't wired into the game. Only requires code changes, no new art.

### Priority 3 — Submission Position Artwork
**Impact:** Sub attack/defend art exists on disk for Marcus and Adele but the submission artwork display system isn't built yet.

### Priority 4 — Adele Fighting Sprites (Tier 2)
**Impact:** Only visible in non-Marcus matchups. Lower priority since ARTWORK_DATA covers Marcus vs Adele grappling.

10-24. All 15 grapple position sprites for Adele (guardTop, guardBtm, mountTop, mountBtm, pressTop, pinned, backTop, backTaken, openGuardTop, openGuardBtm, halfGuardTop, halfGuardBtm, spiderGuard, ashiTop, ashiBtm)

### Priority 5 — Yuki Artwork Integration
**Impact:** Yuki face sheet exists but no ARTWORK_DATA face keys. Marcus vs Yuki test images exist but no grapple artwork system for this pairing.

### Priority 6 — Replace Old-Origin Marcus/Yuki Sprites
**Impact:** Low — current sprites work well visually. But they're untracked and of unknown origin. Could be replaced with properly sourced art when available.

### Priority 7 — Replace Old-Origin Grapple Templates
**Impact:** Low — only shown for non-Marcus-vs-Adele matchups. Templates work but are untracked origin.

---

*This audit reflects the state of `lockdown-deploy/index.html` and `Final Artwork/Accepted/` as of 2026-03-12.*
