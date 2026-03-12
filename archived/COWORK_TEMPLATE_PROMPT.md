# Zone-Colored Grappling Template Generation — Cowork Task

## Context

I'm building a 16-bit BJJ fighting game called LOCKDOWN. Ground grappling positions are rendered using a **zone-colored template system**: we generate ONE template image per position with specific marker colors for each body zone (skin, shorts, belt, head) for each fighter (top/bottom). At runtime, the game's palette-swap engine replaces these zone colors with each character's actual palette, so any character combo looks unique from just ~20 templates.

The templates need to be **CPS2-style pixel art** (Street Fighter Alpha / Capcom vs SNK aesthetic): bold flat colors, clean black outlines, thick linework, high contrast, retro fighting game look. White/transparent background, no text, no floor, no environment.

## Zone Color Specification

Each template has TWO fighters. The **top fighter** (dominant/on-top) uses warm-coded zone colors. The **bottom fighter** (underneath/defending) uses cool-coded zone colors. These EXACT colors must be used:

### Top Fighter (dominant)
| Zone | RGB | Hex | Visual |
|------|-----|-----|--------|
| Skin (all exposed skin) | `rgb(255, 100, 100)` | `#FF6464` | Salmon/coral red |
| Gear (shorts/rashguard) | `rgb(100, 255, 100)` | `#64FF64` | Lime green |
| Belt/waistband | `rgb(100, 100, 255)` | `#6464FF` | Medium blue |
| Head (entire head/hair) | `rgb(255, 50, 50)` | `#FF3232` | Bright red |

### Bottom Fighter (underneath)
| Zone | RGB | Hex | Visual |
|------|-----|-----|--------|
| Skin (all exposed skin) | `rgb(255, 255, 100)` | `#FFFF64` | Bright yellow |
| Gear (shorts/rashguard) | `rgb(255, 100, 255)` | `#FF64FF` | Magenta/pink |
| Belt/waistband | `rgb(100, 255, 255)` | `#64FFFF` | Cyan |
| Head (entire head/hair) | `rgb(255, 200, 50)` | `#FFC832` | Gold/amber |

### Critical Color Rules
- Black outlines (`#111111` or pure black) around ALL body parts — these must be preserved
- Shading: use DARKER versions of the same zone color (not different colors). E.g., shadowed top-skin = darker salmon, not brown
- Each zone color must be clearly distinct and not blend into adjacent zones
- NO white, NO gray, NO brown — only the zone colors above plus black outlines
- Background must be pure white (will be removed by processing pipeline)

## The 8 Positions Needed

Generate ONE image per position. Each shows two fighters in a specific BJJ grappling configuration. Size variants will be handled by scaling at runtime.

### Template 1: CLOSED GUARD
Top fighter kneeling upright INSIDE the guard. Bottom fighter on their back with legs wrapped around top fighter's waist. Top fighter's hands pressing down on bottom's chest/shoulders. Bottom fighter's arms up framing or gripping top fighter. Top fighter is dominant but contained.

### Template 2: MOUNT
Top fighter sitting on bottom fighter's torso in full mount, knees on the ground on either side. Bottom fighter flat on back underneath, arms up trying to frame/push. Top fighter upright and dominant, weight bearing down.

### Template 3: SIDE CONTROL
Top fighter lying perpendicular across bottom fighter's chest. Top has one arm under bottom's head (crossface), other arm controlling hip. Bottom fighter flat on back being pinned, legs flat. Viewed slightly from above/side angle. Top fighter pressing chest-to-chest.

### Template 4: HALF GUARD
Top fighter pressing down with chest-to-chest pressure, partially past bottom's guard. Bottom fighter on back with ONE leg entangled/wrapped around one of top fighter's legs (the key half-guard detail). Top fighter working to pass with crossface.

### Template 5: BACK CONTROL
Top fighter sitting BEHIND bottom fighter, both facing same direction. Top has legs wrapped around bottom's waist (hooks in). Top fighter's arm under bottom's chin threatening rear naked choke. Bottom fighter seated/leaning forward, hands defensively grabbing the choking arm.

### Template 6: TURTLE
Bottom fighter in turtle position — on hands and knees, curled up defensively face-down. Top fighter sprawled on top of bottom's back, chest pressing down, arms reaching around trying to insert hooks or threaten choke. Top fighter is the attacker.

### Template 7: OPEN GUARD
Top fighter crouching/kneeling over bottom fighter, hands gripping bottom's legs/knees trying to pass. Bottom fighter on back with legs UP and OPEN, feet on top fighter's hips/thighs creating distance. Active guard position.

### Template 8: STANDING CLINCH
Both fighters standing, chest-to-chest in a Muay Thai/wrestling clinch. Top fighter has dominant position — head on inside, double underhooks, driving forward. Bottom fighter has head on outside, being driven back. Both upright but top fighter clearly winning the clinch.

## Image Generation Workflow

### Step 1: Generate with ChatGPT/DALL-E

For each position, use this prompt structure:

```
CPS2 16-bit pixel art style. Bold flat colors, clean black outlines, thick black linework. White background. No text, no UI, no floor, no environment.

Two fighters in [POSITION DESCRIPTION].

CRITICAL COLOR REQUIREMENT — use EXACTLY these colors:
- TOP fighter (dominant): Salmon-red skin (#FF6464), lime-green shorts (#64FF64), blue belt (#6464FF), bright-red head (#FF3232)
- BOTTOM fighter (underneath): Yellow skin (#FFFF64), magenta shorts (#FF64FF), cyan belt (#64FFFF), gold head (#FFC832)
- ALL body parts outlined in black
- Shading uses darker shades of the SAME zone color only
- No other colors except zone colors + black outlines + white background

[INSERT SPECIFIC POSITION DESCRIPTION FROM ABOVE]
```

### Step 2: Multi-LLM Review

After each image is generated, it MUST be reviewed. Send the image to a second model (Gemini, Grok, or another ChatGPT session) with this review prompt:

```
Review this image against these criteria. Score each 1-5 and provide PASS/FAIL:

1. POSITION ACCURACY: Does it show the correct BJJ position? Is the top fighter actually on top/dominant? Is body positioning anatomically correct for this grappling position?

2. ZONE COLOR COMPLIANCE:
   - Top fighter skin: salmon/coral red (#FF6464)?
   - Top fighter gear: lime green (#64FF64)?
   - Top fighter belt: blue (#6464FF)?
   - Top fighter head: bright red (#FF3232)?
   - Bottom fighter skin: yellow (#FFFF64)?
   - Bottom fighter gear: magenta (#FF64FF)?
   - Bottom fighter belt: cyan (#64FFFF)?
   - Bottom fighter head: gold (#FFC832)?
   - Are there any non-zone colors present (brown, gray, white on bodies)?

3. ART STYLE: CPS2/16-bit pixel art aesthetic? Bold outlines? Clean linework? High contrast?

4. COMPOSITION: White background? No environment/floor? Both fighters fill the frame? No text?

5. ZONE SEPARATION: Are all zones clearly distinct? Can you tell where skin ends and gear begins? Are outlines separating zones?

VERDICT: Only PASS if ALL criteria score 3+ and no zone colors are missing/wrong.
If FAIL, specify exactly what needs to be regenerated.
```

### Step 3: Consensus Gate

An image only proceeds to the game pipeline when:
- Claude confirms: position is correct, colors look right, art style matches
- The reviewing LLM (Gemini/Grok) PASSES the image on all 5 criteria
- If either rejects: regenerate with specific correction notes and repeat

### Step 4: Processing

Once all 8 approved images are saved to `raw_sprites/` as:
```
T1_guard_template.png
T2_mount_template.png
T3_sidecontrol_template.png
T4_halfguard_template.png
T5_backcontrol_template.png
T6_turtle_template.png
T7_openguard_template.png
T8_clinch_template.png
```

Run the processing pipeline:
```bash
node scripts/process_sprites.js --mode ground
node scripts/inject_scenes.js
```

## Expected Difficulty

ChatGPT/DALL-E struggles with exact hex colors. Expect:
- 2-3 regenerations per image to get zone colors right
- The reviewer LLM catching color drift (e.g., salmon becoming orange, yellow becoming cream)
- Some positions (back control, turtle) being harder to pose correctly

If colors consistently drift, try adding to the ChatGPT prompt:
- "The top fighter must look like they were dunked in salmon-red paint. The bottom fighter must look like they were dunked in bright yellow paint."
- "Think of this as a color-by-numbers template where each body zone has a FLAT, SATURATED, DISTINCT color."
- "NO realistic skin tones. NO natural colors. These are MARKER COLORS for a template system."

## Success Criteria

All 8 template images must:
- Show anatomically correct BJJ positions
- Use exact zone colors (±20 RGB tolerance is acceptable, ±50 is NOT)
- Have clean black outlines separating all zones
- Be CPS2/retro fighting game art style
- Have pure white backgrounds
- Show two complete fighters filling the frame
- Pass review by both Claude and a second LLM
