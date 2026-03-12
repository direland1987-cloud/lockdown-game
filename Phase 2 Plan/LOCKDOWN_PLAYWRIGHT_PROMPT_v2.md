# LOCKDOWN — Autonomous Test & Fix Loop

> Paste this into Claude Code. Run from the `lockdown-deploy/` directory.
> Claude Code will: discover → test → fix → retest → repeat until clean.

---

## Your Mission

You are the QA engineer and bug fixer for LOCKDOWN, a single-file HTML fighting game (`index.html`). Your job is to make this game bulletproof. You will:

1. **READ the entire codebase** — understand every screen, component, data structure, state machine, and interaction
2. **SET UP Playwright** — automated browser testing with headless Chromium
3. **DISCOVER what needs testing** — don't just test what I tell you. Read the code, find every feature, every screen, every user path, every edge case
4. **WRITE tests** for everything you discover
5. **RUN tests** and collect results
6. **FIX bugs** you find — edit `index.html` directly
7. **RETEST** after every fix
8. **LOOP** steps 5-7 until all tests pass with zero console errors
9. **REPORT** what you found and fixed

---

## Phase 1 — Understand the Game

Before writing a single test, read `index.html` completely and build a mental map of:

### Code Discovery Checklist
- [ ] **All screen states** — find every value of `screen` (title, select, difficulty, fight, result, and any others)
- [ ] **All fight phases** — find every value of `phase` (grip_fight, player_pick, player_minigame, ai_think, sub_cutscene, sub_minigame, defense_minigame, banner, done, and any others)
- [ ] **All characters** — parse the CHARS array, note which are locked/unlocked, check all required fields exist
- [ ] **All positions** — parse POS object, verify POS_DOM, POS_MAP_DATA, POS_LAYOUT, POS_LINKS, POS_AFFINITY all have entries for every position
- [ ] **All moves** — parse MOVES object, verify every move's target position exists, stat field exists on characters, cost/dmg are valid numbers, type is valid
- [ ] **All minigame types** — find every minigame component (SequenceMinigame, PowerMeterMinigame, TimingRingMinigame, RapidTapMinigame, SubmissionMinigame, GripFightMinigame)
- [ ] **All sprite/artwork keys** — find every key in SPRITE_DATA and ARTWORK_DATA, verify every reference to getSprite(), resolveSprite(), getArtworkSprite(), getGrappleSprite() resolves to a real key
- [ ] **All audio** — find every Music/Sound reference, note which MP3 files are expected
- [ ] **All state variables** — find every useState, verify nothing can be undefined when accessed
- [ ] **All event handlers** — find every onClick, onTouchStart, verify the handler function exists
- [ ] **Removed/dead code** — search for references to removed content (Turtle position, old position names, deleted characters, commented-out features)
- [ ] **Easter eggs and challenges** — find all EASTER_EGGS and CHALLENGES, verify their check functions reference valid state

Write your findings to `LOCKDOWN_CODE_MAP.md` before writing any tests.

---

## Phase 2 — Set Up Playwright

```bash
npm init -y
npm install -D @playwright/test
npx playwright install chromium --with-deps
```

Create `playwright.config.ts`:
- Serve index.html locally (use `npx serve . -l 8080 -s` or python http.server)
- Two projects: `desktop` (1280×800) and `mobile` (iPhone 12: 390×844, touch, deviceScaleFactor 3)
- Screenshot on failure, capture console messages
- 60 second timeout per test (the game has animations and delays)
- Retries: 0 (we want to see real failures, not flaky retries)

---

## Phase 3 — Write Tests (Discovery-Driven)

DO NOT just test a fixed list. Use your code map from Phase 1 to generate tests dynamically. The principle is: **if it exists in the code, it gets tested.**

### Category A — Static Code Validation (No Browser Needed)

Write a Node.js script `tests/static-audit.spec.ts` that:
- Extracts the JavaScript from `index.html`
- Parses all data structures (CHARS, MOVES, POS, POS_DOM, POS_AFFINITY, SPRITE_DATA, ARTWORK_DATA, etc.)
- Cross-references every data dependency:
  - Every move's `target` references a valid POS entry
  - Every move's `stat` exists on every character in CHARS
  - Every move's `type` is one of the valid minigame types
  - Every character has all required fields (id, name, short, stats, palette, heads, etc.)
  - Every POS value appears in POS_DOM, POS_MAP_DATA, POS_LAYOUT
  - Every POS_AFFINITY entry covers all positions for all characters
  - Every sprite key referenced in resolveSprite/getSprite has a matching entry in SPRITE_DATA
  - Every artwork key referenced has a matching entry in ARTWORK_DATA
  - No references to removed content (Turtle, etc.)
- Reports every broken reference, missing key, or data inconsistency

### Category B — Screen Navigation (Browser Tests)

Test every possible navigation path through the game:
- Splash → Menu → Character Select → Difficulty → Fight
- Every back button
- Every screen transition
- Character select with each unlocked character
- Difficulty select with each option (Easy, Medium, Hard)
- Opponent selection (random and manual)
- Result screen → Rematch, New Fight, Main Menu

### Category C — Fight Gameplay (Browser Tests)

For each unlocked character:
- Start a fight on each difficulty
- Complete the grip fight
- Verify moves appear for the starting position
- Click each available move and verify minigame launches
- Complete the minigame (click the action button)
- Verify state advances (turn counter, stamina, position changes)
- Play through at least 10 turns or until fight ends naturally
- Verify victory/defeat screen appears correctly

### Category D — Every Position's Moves

This is critical. For each position in the game:
- Programmatically set the game to that position (or play until you reach it)
- Verify moves load for both top and bottom
- Verify each move button is visible and clickable
- Verify stamina cost is displayed
- Click each move and verify minigame type matches the move's `type` field

### Category E — Minigame Functionality

For each minigame type (sequence, power, timing, tap, submission, grip):
- Verify the minigame UI renders
- Verify action buttons exist and are clickable
- Verify completing the minigame (by clicking buttons) closes the overlay
- Verify the game doesn't crash after minigame completion
- Test both success and failure paths where possible

### Category F — Submission System

- Navigate to a position where submissions are available
- Click a submission move
- Verify submission cutscene appears (face artwork, "VS" text, submission name)
- Verify submission minigame appears after cutscene
- Complete the submission minigame
- Verify result (either tap out or escape)

### Category G — Mobile Specific

On iPhone 12 viewport:
- No horizontal scrolling anywhere in the game
- All interactive elements meet 44px minimum touch target
- Stamina bars, move buttons, and arena all visible without scrolling
- Touch events work on splash screen
- Move buttons don't get clipped or hidden
- Position map and combat log collapse works on mobile

### Category H — Edge Cases & Error Resilience

- What happens if you click rapidly during transitions?
- What happens at 0 stamina?
- What if both fighters reach 0 stamina same turn?
- What happens during AI thinking phase if you try to interact?
- LocalStorage failures (clear storage, verify game still loads)
- Missing audio files (verify game doesn't crash if MP3s aren't found)

### Category I — Visual Verification

- Every character sprite renders (img elements have naturalWidth > 0)
- Grapple artwork loads for Marcus vs Adele matchup
- Arena backgrounds render (verify background CSS isn't empty)
- Stamina bar colors change as stamina decreases
- Animations play without JS errors

### Category J — Everything Else You Find

As you read the code, you'll discover features I haven't mentioned. Test them all. Some things that exist in the code:
- Easter egg system (EASTER_EGGS array with check functions)
- Daily challenge system
- Streak tracking and records
- Momentum system (🔥 indicators)
- Combat log messages
- Banner system
- Toast notifications
- Anime impact effects
- Arena shake effects
- Character facing/mirroring
- Submission cutscene with face artwork

If you find something, test it.

---

## Phase 4 — The Fix Loop

This is the most important part. After running tests:

```
WHILE (failing tests exist OR console errors found):
    1. Read the test failure details
    2. Identify the root cause in index.html
    3. Fix the bug in index.html (edit the file directly)
    4. Re-run ONLY the failing tests to verify the fix
    5. Run the FULL suite to check for regressions
    6. Log what you found and fixed
```

### Rules for Fixing:
- **Fix the actual bug**, don't make the test pass by weakening the assertion
- **Don't break other things** — run full suite after every fix
- **Document every fix** — what was broken, what you changed, why
- **If a fix is risky or unclear**, describe it but don't apply it — flag it for human review
- **Never remove game features** to make tests pass
- **Console errors are bugs** — every console.error and uncaught exception must be resolved or explained

### Loop Exit Conditions:
- All tests pass AND zero console errors → **SUCCESS, write final report**
- You've done 10+ fix cycles with no progress → **STOP, write report with remaining issues**
- A bug requires design decisions (not just code fixes) → **FLAG IT, continue with other fixes**

---

## Phase 5 — Final Report

Create `LOCKDOWN_TEST_REPORT.md` with:

### Section 1: Code Map Summary
- Total screens, phases, characters, positions, moves, minigames discovered
- Any dead code or orphaned references found

### Section 2: Test Results
- Total tests written and run
- Pass / Fail / Skipped counts
- Per-category breakdown (A through J)

### Section 3: Bugs Found & Fixed
For each bug:
- **What**: Description of the bug
- **Where**: File, line, function
- **Severity**: Critical (crash) / High (broken feature) / Medium (visual) / Low (cosmetic)
- **Fix**: What you changed
- **Verified**: Did the fix pass retesting?

### Section 4: Bugs Found & NOT Fixed
For each unfixed issue:
- **What**: Description
- **Why not fixed**: Needs design decision / Too risky / Unclear root cause
- **Recommendation**: What should be done

### Section 5: Console Error Log
Every unique JS error captured, with:
- Error message
- Screen/phase where it occurred
- Frequency (how many times across all tests)
- Whether it was fixed

### Section 6: Mobile Issues
Every viewport/overflow/touch issue found on iPhone 12

### Section 7: Recommendations
Top 10 things to fix or improve, ordered by impact on player experience

---

## Important Context

### Game Architecture
- Single HTML file (~1MB code + ~3.4MB base64 images)
- React 18 via CDN (not bundled)
- Tailwind CSS via CDN
- No build step — edit index.html directly
- State managed via React hooks (useState, useCallback, useRef)
- Game phases controlled by a state machine (screen + phase variables)

### Known Issues (from task list)
- Adele has 0 real individual sprites (portrait used as placeholder for all 24 poses)
- Yuki artwork embedded but not wired into game code
- Submission artwork display system not built yet
- Some animations may reference old build content

### Things That SHOULD Work (verify they do)
- Marcus vs Adele: hand-drawn grapple artwork for all ground positions
- All 4 minigame types
- Submission cutscene with face close-ups
- 5 animated arena backgrounds
- Blink and breathing animations on fighters
- Anime impact effects during combat
- Daily challenges
- Easter eggs
- Sound effects (SoundEngine) and music (MusicEngine)

### Audio Note
Audio will likely fail in headless Chromium. That's expected. Catch the errors but don't count audio-related failures as bugs. DO verify that audio errors don't crash the game.

---

## One More Thing

After the test suite is stable and the report is written, **add a `test:watch` npm script** that reruns all tests on file change. This way, as future development happens, the tests keep running automatically.

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:mobile": "npx playwright test --project=mobile",
    "test:desktop": "npx playwright test --project=desktop",
    "test:debug": "npx playwright test --headed --project=desktop"
  }
}
```

Now go. Read the code. Discover everything. Test everything. Fix everything. Loop until clean.
