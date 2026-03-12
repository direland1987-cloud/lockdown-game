# LOCKDOWN — Cowork Automation Prompt
## Bulk Image Generation via ChatGPT

---

## COWORK MASTER PROMPT

Copy and paste everything below this line into Claude Cowork as your task prompt:

---

You are automating the creation of CPS2 16-bit pixel art images for a BJJ fighting game called "Lockdown." You will generate images using ChatGPT's image generation, one image per new ChatGPT conversation.

### REFERENCE FILES

All reference files (character and position) are located in:
`C:\Users\direl\Downloads\Accepted\References`

**High-Quality Character References (Google Drive — public):**
https://drive.google.com/drive/folders/14UOhkrX5SJNFf_tW8pUKhjjMtJpLRkFs?usp=sharing

**Character References (ALL 4 used in EVERY prompt):**
- `Adele.png` — Adele's full-body standing character sprite reference
- `Adele Face Sheet.png` — Adele's face/head detail reference sheet
- `Marcus.png` — Marcus's full-body standing character sprite reference
- `Marcus Face Sheet.png` — Marcus's face/head detail reference sheet

**Position References (one per position — used alongside the 4 character refs):**
These are in the same References folder. Each is a real BJJ photo or illustration showing the exact position, named with the format `reference [position].png`. The full list:

- `reference closed guard.png`
- `reference open guard.png`
- `reference half guard.png`
- `reference side control.png`
- `reference mount.png`
- `reference back control.png`
- `reference turtle.png`
- `reference standing clinch.png`
- `reference knee on belly.png`
- `reference north south.png`
- `reference butterfly guard.png`
- `reference ashi garami.png`

**Existing completed images (SKIP these — see checklist):**
- Half Guard — Adele on top
- Closed Guard — Adele on top
- Open Guard — Adele on top
- Mount — Adele on top
- Back Control — Adele on top
- Standing Clinch — Adele on top

**Output folder for completed images:**
`C:\Users\direl\Downloads\Accepted`

---

### WORKFLOW — REPEAT FOR EACH IMAGE

There are **18 images** remaining to generate (6 are already complete — see checklist). **SKIP any prompt marked ✅ Done in the checklist.** For each remaining one:

1. **Open a brand new ChatGPT conversation** (do not reuse a conversation — each image must be generated in a fresh chat for best results)
2. **Upload exactly 5 images** to the ChatGPT message:
   - `Adele.png` (full-body character reference)
   - `Adele Face Sheet.png` (face detail reference)
   - `Marcus.png` (full-body character reference)
   - `Marcus Face Sheet.png` (face detail reference)
   - The position reference image for the current position (e.g., `reference back control.png`)
   All from: `C:\Users\direl\Downloads\Accepted\References`
3. **Paste the exact prompt** from the prompt list below (match the position and variant)
4. **Wait for ChatGPT to generate the image**
5. **REVIEW the generated image** (see Quality Review Checklist below)
6. **If the image PASSES review** → Download, rename, move to accepted folder (step 8)
7. **If the image FAILS review** → Reprompt in the SAME ChatGPT conversation with a correction message (see Reprompt Instructions below). You have up to **2 retries (3 attempts total)** per image.
   - After each retry, review the new image against the same checklist
   - If it passes on retry → Download, rename, move to accepted folder
   - If all 3 attempts fail → Log the image in the FAILED LIST at the end, note what kept going wrong, and move to the next image
8. **Download the generated image, rename** using the exact filename specified in the prompt list
9. **Move the renamed file** to `C:\Users\direl\Downloads\Accepted`
10. **Move to the next image** — open a new ChatGPT conversation and repeat

---

### QUALITY REVIEW CHECKLIST

After each image is generated, check ALL of the following before accepting. If ANY item fails, the image must be reprompted.

**1. Art Style**
- [ ] CPS2 16-bit pixel art style — chunky pixels visible, NOT 3D, NOT realistic, NOT cel-shaded, NOT smooth digital painting
- [ ] Bold black outlines on both characters
- [ ] Rich colour with detailed pixel shading (not flat, not gradient airbrush)
- [ ] White background with subtle blue-grey drop shadow on floor
- [ ] No text, no UI elements, no watermarks

**2. Adele — Character Accuracy**
- [ ] Fair peach skin tone (not too pale, not tanned)
- [ ] Long golden-blonde braided ponytail with purple hair tie
- [ ] Blue eyes (check against face sheet)
- [ ] Black short-sleeve compression top with **visible neon lime-green accent stripes** on shoulders/sleeves
- [ ] Black compression shorts with **lime-green side stripe**
- [ ] Left ankle wrap, bare feet
- [ ] Athletic curvy build — proportions match full-body sprite reference

**3. Marcus — Character Accuracy**
- [ ] Deep dark orange-brown skin tone (NOT lightened — check against full-body sprite)
- [ ] Short black hair
- [ ] Bare chest, muscular build matching reference
- [ ] Dark grey MMA shorts with **bold red side panel**
- [ ] Black knee pads, black ankle wraps
- [ ] Black fingerless MMA gloves
- [ ] Massively muscular build — proportions match full-body sprite reference

**4. Position Accuracy**
- [ ] Correct fighter is on top/dominant (check filename — first name = top fighter)
- [ ] Body positions match the BJJ position described in the prompt
- [ ] Limbs are in anatomically correct positions for the technique
- [ ] Weight distribution looks realistic for the position
- [ ] No extra limbs, missing limbs, or merged/fused body parts
- [ ] Both fighters fill the frame

**5. Overall Quality**
- [ ] Both characters are clearly distinguishable
- [ ] No major anatomical errors (extra fingers, broken joints, etc.)
- [ ] Image is clean and could be used as a game sprite reference

---

### REPROMPT INSTRUCTIONS

When an image fails review, send a follow-up message in the SAME ChatGPT conversation. Structure the correction message based on what failed:

**If art style is wrong:**
> "This must be CPS2 16-bit pixel art style. NOT 3D, NOT realistic, NOT cel-shaded, NOT smooth digital art. I need chunky visible pixels, bold black outlines, and flat colour blocks with pixel-level shading — like Street Fighter Alpha or Capcom vs SNK sprites. Please regenerate."

**If Adele's outfit details are wrong (lime-green stripes missing):**
> "Adele's compression top and shorts must have highly visible neon yellow-green/lime-green stripe accents — this is critical to her design. Please reference her full-body sprite image and regenerate."

**If Marcus's skin tone is too light:**
> "Marcus has deep dark orange-brown skin — very saturated and rich. Please reference his full-body sprite image exactly and do not lighten his skin tone. Regenerate."

**If facial features or hair are wrong:**
> "Please closely reference the face sheet images provided for each character. Adele has a golden-blonde Dutch braid ponytail with purple hair tie and blue eyes. Marcus has short black hair. Regenerate with accurate facial features."

**If the BJJ position is anatomically wrong:**
> "The body positions are incorrect for this BJJ technique. Please closely reference the position photo I uploaded — the limb placement, weight distribution, and body angles must match real grappling technique. Regenerate."

**If there are extra/missing/fused limbs:**
> "There are anatomical errors — [describe specific issue: e.g., 'Marcus appears to have 3 arms' or 'Adele's legs are fused together']. Each fighter has exactly 2 arms and 2 legs, all clearly visible and separate. Regenerate."

**Combine multiple corrections** into one message if several things are wrong. Always end with "Please regenerate."

---

### FAILED IMAGE LOG

If an image fails all 3 attempts, log it here before moving on:

| Position | Variant | Issue Summary |
|----------|---------|---------------|
| *(filled in during run)* | | |

The user will manually redo these after the batch is complete.

### IMPORTANT RULES
- NEVER reuse a ChatGPT conversation BETWEEN images. Each new image = new chat. But retries for the SAME image happen in the same chat.
- Always upload all 5 reference images (both full-body sprites + both face sheets + the position ref).
- Maximum 3 attempts per image (1 initial + 2 retries). After 3 failures, log it and move on.
- Use the EXACT filename specified — the naming convention encodes who is on top.
- Only move images that PASS the quality review to the Accepted folder.
- Process all Adele-on-top variants first (Section A), then all Marcus-on-top variants (Section B).

### FILENAME CONVENTION
- **`Adele Marcus [Position].png`** = Adele is the TOP/DOMINANT fighter
- **`Marcus Adele [Position].png`** = Marcus is the TOP/DOMINANT fighter

### POSITION REFERENCE FILE MAPPING
Use this table to know which reference file to upload for each position (both the Adele-top and Marcus-top variants use the SAME position reference):

| Position | Reference File to Upload |
|----------|--------------------------|
| Closed Guard | `reference closed guard.png` |
| Open Guard | `reference open guard.png` |
| Half Guard | `reference half guard.png` |
| Side Control | `reference side control.png` |
| Mount | `reference mount.png` |
| Back Control | `reference back control.png` |
| Turtle | `reference turtle.png` |
| Standing Clinch | `reference standing clinch.png` |
| Knee on Belly | `reference knee on belly.png` |
| North-South | `reference north south.png` |
| Butterfly Guard | `reference butterfly guard.png` |
| Ashi Garami | `reference ashi garami.png` |

---

## SECTION A — ADELE ON TOP (Dominant) / MARCUS ON BOTTOM

**SKIP: A1 (Closed Guard), A2 (Open Guard), A4 (Mount), A5 (Back Control), A7 (Standing Clinch) — these are already complete. Also skip Half Guard (already done previously). Start with A3 (Side Control).**

---

### A1: CLOSED GUARD — Adele on Top
**Filename:** `Adele Marcus Closed Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in closed guard position.

ADELE (top fighter, dominant) is kneeling upright inside Marcus's closed guard, posturing up with both hands pressing down on his chest trying to create space and pass. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter) is flat on his back with legs wrapped tightly around Adele's waist in closed guard, ankles locked behind her back. Arms reaching up to grip her wrists or collar, pulling her posture down. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ closed guard position. Reference the position image provided.
```

---

### A2: OPEN GUARD — Adele on Top
**Filename:** `Adele Marcus Open Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in open guard position.

ADELE (top fighter, dominant) is crouching/kneeling over Marcus, leaning forward with both hands gripping his knees or shins, actively working to pass his guard. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter) is on his back with legs raised and open, feet planted on Adele's hips or thighs pushing her away to maintain distance, playing open guard. His hands grip her wrists for control. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ open guard position. Reference the position image provided.
```

---

### A3: SIDE CONTROL — Adele on Top
**Filename:** `Adele Marcus Side Control.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in side control position.

ADELE (top fighter, dominant) is lying perpendicular across Marcus's chest, pressing her full weight down. Her near arm is snaked under his head applying crossface pressure, her far arm controls his near hip. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail hanging to the side with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter) is flat on his back being pinned, legs flat on the ground, both arms pushing against Adele's body trying to create frames and escape. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Viewed from the side. Both fighters fill the frame. Anatomically correct BJJ side control position. Reference the position image provided.
```

---

### A4: MOUNT — Adele on Top
**Filename:** `Adele Marcus Mount.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in full mount position.

ADELE (top fighter, dominant) is sitting in full mount on Marcus's torso, knees on the ground on either side of his ribcage, sitting upright with controlled posture, hands on his chest or posted for base. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter) is flat on his back underneath Adele, arms raised trying to frame and push her hips away, face showing strain. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ full mount position. Reference the position image provided.
```

---

### A5: BACK CONTROL — Adele on Top
**Filename:** `Adele Marcus Back Control.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in back control / rear mount position.

ADELE (top fighter, dominant) is seated behind Marcus, both facing the same direction. She has both hooks (legs) wrapped inside Marcus's thighs controlling his hips, one arm snaked under his chin threatening a rear naked choke, other hand gripping her own wrist to cinch the grip (seatbelt control). Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter, being controlled) is seated leaning forward, both hands gripping Adele's choking forearm trying to defend the choke. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both facing the same direction. Both fighters fill the frame. Anatomically correct BJJ back control / rear naked choke position. Reference the position image provided.
```

---

### A6: TURTLE — Adele on Top
**Filename:** `Adele Marcus Turtle.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in turtle position.

MARCUS (bottom fighter) is in turtle — on his hands and knees, curled up defensively face-down, elbows tight to his body, chin tucked protecting his neck. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (top fighter, dominant) is draped across Marcus's back, chest pressing down on his upper back, one arm reaching under his chin attempting a choke, other arm hooking around his far hip trying to insert a leg hook to take the back. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail hanging to one side with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ turtle top control position. Reference the position image provided.
```

---

### A7: STANDING CLINCH — Adele Dominant
**Filename:** `Adele Marcus Standing Clinch.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in a standing clinch position.

ADELE (dominant fighter) has the inside position — head pressed to Marcus's chest/shoulder, both arms with underhooks driving forward aggressively, weight forward on the attack. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (losing the clinch) has his head on the outside, being driven backward and off-balance, back foot dragging, arms locked over Adele's shoulders in overhooks but clearly being outworked and dominated. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters standing upright. Both fighters fill the frame. Anatomically correct Muay Thai/wrestling clinch position. Reference the position image provided.
```

---

### A8: KNEE ON BELLY — Adele on Top
**Filename:** `Adele Marcus Knee on Belly.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in knee on belly position.

ADELE (top fighter, dominant) has her near knee driven into Marcus's stomach/solar plexus, her far leg posted out wide for base and balance, torso upright with one hand gripping his collar/lapel area and the other controlling his near hip. Driving weight down through the knee. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter) is flat on his back, face grimacing from the knee pressure, both hands pushing at Adele's knee trying to relieve the pressure, legs flat or slightly raised. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ knee on belly position. Reference the position image provided.
```

---

### A9: NORTH-SOUTH — Adele on Top
**Filename:** `Adele Marcus North South.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in north-south position.

ADELE (top fighter, dominant) is lying chest-to-chest on top of Marcus but facing the OPPOSITE direction — her head is near his hips, her hips are near his head. She is pressing her weight down, arms controlling his hips or wrapping around his waist to prevent escape. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (bottom fighter) is flat on his back being pinned, head near Adele's hips, arms trapped or pushing at her hips to create space. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Fighters are head-to-toe (opposite directions). Both fighters fill the frame. Anatomically correct BJJ north-south pin position. Reference the position image provided.
```

---

### A10: BUTTERFLY GUARD — Adele on Top
**Filename:** `Adele Marcus Butterfly Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in butterfly guard position.

MARCUS (bottom fighter, playing guard) is seated upright on the mat with both feet hooked inside Adele's thighs (butterfly hooks), knees wide, arms gripping Adele's collar/head in an underhook or collar tie, ready to sweep. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (top fighter, trying to pass) is kneeling between Marcus's butterfly hooks, leaning forward with her hands on his shoulders or chest trying to flatten him out and neutralise the hooks. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ butterfly guard position. Reference the position image provided.
```

---

### A11: ASHI GARAMI — Adele on Top
**Filename:** `Adele Marcus Ashi Garami.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in ashi garami (single leg X / leg entanglement) position.

ADELE (attacking fighter, dominant) is on her back or seated, controlling one of Marcus's legs between her legs in ashi garami. Her legs are entangled around his lead leg — one foot on his far hip as a hook, the other leg triangled or wrapped around his trapped knee/calf area. Both hands grip his trapped foot, hugging it to her chest and turning it for a heel hook or ankle lock attack. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defending fighter) is on his back or partially seated, his lead leg trapped in Adele's leg entanglement. He is reaching forward trying to grip her legs or peel her hands off his foot to defend the submission. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ ashi garami / leg entanglement position. Reference the position image provided.
```

---

## SECTION B — MARCUS ON TOP (Dominant) / ADELE ON BOTTOM

---

### B0: HALF GUARD — Marcus on Top
**Filename:** `Marcus Adele Half Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in half guard position.

MARCUS (top fighter, dominant) is in top half guard, driving his weight down with his chest pressing on Adele. One leg is trapped between Adele's legs in half guard. He has an underhook with his near arm and is crossfacing with his far arm, working to free his trapped leg and pass. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter, playing half guard) is on her back or slightly on her side, both legs wrapped around one of Marcus's legs to control it in half guard, arms framing against his neck and shoulder. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ half guard position. Reference the position image provided.
```

---

### B1: CLOSED GUARD — Marcus on Top
**Filename:** `Marcus Adele Closed Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in closed guard position.

MARCUS (top fighter, dominant) is kneeling upright inside Adele's closed guard, posturing up with both hands pressing down on her chest trying to create space and pass. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter) is flat on her back with legs wrapped tightly around Marcus's waist in closed guard, ankles locked behind his back. Arms reaching up to grip his wrists, pulling his posture down. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ closed guard position. Reference the position image provided.
```

---

### B2: OPEN GUARD — Marcus on Top
**Filename:** `Marcus Adele Open Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in open guard position.

MARCUS (top fighter, dominant) is crouching/kneeling over Adele, leaning forward with both hands gripping her knees or shins, actively working to pass her guard. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter) is on her back with legs raised and open, feet planted on Marcus's hips or thighs pushing him away to maintain distance, playing open guard. Her hands grip his wrists for control. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ open guard position. Reference the position image provided.
```

---

### B3: SIDE CONTROL — Marcus on Top
**Filename:** `Marcus Adele Side Control.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in side control position.

MARCUS (top fighter, dominant) is lying perpendicular across Adele's chest, pressing his full weight down. His near arm is snaked under her head applying crossface pressure, his far arm controls her near hip. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter) is flat on her back being pinned, legs flat on the ground, both arms pushing against Marcus's body trying to create frames and escape. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Viewed from the side. Both fighters fill the frame. Anatomically correct BJJ side control position. Reference the position image provided.
```

---

### B4: MOUNT — Marcus on Top
**Filename:** `Marcus Adele Mount.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in full mount position.

MARCUS (top fighter, dominant) is sitting in full mount on Adele's torso, knees on the ground on either side of her ribcage, sitting upright with controlled posture, hands on her chest or posted for base. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter) is flat on her back underneath Marcus, arms raised trying to frame and push his hips away, face showing strain. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ full mount position. Reference the position image provided.
```

---

### B5: BACK CONTROL — Marcus on Top
**Filename:** `Marcus Adele Back Control.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in back control / rear mount position.

MARCUS (top fighter, dominant) is seated behind Adele, both facing the same direction. He has both hooks (legs) wrapped inside Adele's thighs controlling her hips, one arm snaked under her chin threatening a rear naked choke, other hand gripping his own wrist to cinch the grip (seatbelt control). Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter, being controlled) is seated leaning forward, both hands gripping Marcus's choking forearm trying to defend the choke. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both facing the same direction. Both fighters fill the frame. Anatomically correct BJJ back control / rear naked choke position. Reference the position image provided.
```

---

### B6: TURTLE — Marcus on Top
**Filename:** `Marcus Adele Turtle.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in turtle position.

ADELE (bottom fighter) is in turtle — on her hands and knees, curled up defensively face-down, elbows tight to her body, chin tucked protecting her neck. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail hanging down with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (top fighter, dominant) is draped across Adele's back, chest pressing down on her upper back, one arm reaching under her chin attempting a choke, other arm hooking around her far hip trying to insert a leg hook to take the back. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ turtle top control position. Reference the position image provided.
```

---

### B7: STANDING CLINCH — Marcus Dominant
**Filename:** `Marcus Adele Standing Clinch.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in a standing clinch position.

MARCUS (dominant fighter) has the inside position — head pressed to Adele's shoulder, both arms with underhooks driving forward aggressively, weight forward on the attack. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (losing the clinch) has her head on the outside, being driven backward and off-balance, back foot dragging, arms locked over Marcus's shoulders in overhooks but clearly being outworked and dominated. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters standing upright. Both fighters fill the frame. Anatomically correct Muay Thai/wrestling clinch position. Reference the position image provided.
```

---

### B8: KNEE ON BELLY — Marcus on Top
**Filename:** `Marcus Adele Knee on Belly.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in knee on belly position.

MARCUS (top fighter, dominant) has his near knee driven into Adele's stomach/solar plexus, his far leg posted out wide for base and balance, torso upright with one hand gripping her collar area and the other controlling her near hip. Driving weight down through the knee. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter) is flat on her back, face grimacing from the knee pressure, both hands pushing at Marcus's knee trying to relieve the pressure, legs flat or slightly raised. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ knee on belly position. Reference the position image provided.
```

---

### B9: NORTH-SOUTH — Marcus on Top
**Filename:** `Marcus Adele North South.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in north-south position.

MARCUS (top fighter, dominant) is lying chest-to-chest on top of Adele but facing the OPPOSITE direction — his head is near her hips, his hips are near her head. He is pressing his weight down, arms controlling her hips or wrapping around her waist to prevent escape. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (bottom fighter) is flat on her back being pinned, head near Marcus's hips, arms trapped or pushing at his hips to create space. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Fighters are head-to-toe (opposite directions). Both fighters fill the frame. Anatomically correct BJJ north-south pin position. Reference the position image provided.
```

---

### B10: BUTTERFLY GUARD — Marcus on Top
**Filename:** `Marcus Adele Butterfly Guard.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in butterfly guard position.

ADELE (bottom fighter, playing guard) is seated upright on the mat with both feet hooked inside Marcus's thighs (butterfly hooks), knees wide, arms gripping Marcus's head or collar in an underhook or collar tie, ready to sweep. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (top fighter, trying to pass) is kneeling between Adele's butterfly hooks, leaning forward with his hands on her shoulders or chest trying to flatten her out and neutralise the hooks. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ butterfly guard position. Reference the position image provided.
```

---

### B11: ASHI GARAMI — Marcus on Top
**Filename:** `Marcus Adele Ashi Garami.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail. Match the position reference image for the BJJ position.

Two BJJ fighters in ashi garami (single leg X / leg entanglement) position.

MARCUS (attacking fighter, dominant) is on his back or seated, controlling one of Adele's legs between his legs in ashi garami. His legs are entangled around her lead leg — one foot on her far hip as a hook, the other leg triangled or wrapped around her trapped knee/calf area. Both hands grip her trapped foot, hugging it to his chest and turning it for a heel hook or ankle lock attack. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defending fighter) is on her back or partially seated, her lead leg trapped in Marcus's leg entanglement. She is reaching forward trying to grip his legs or peel his hands off her foot to defend the submission. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ ashi garami / leg entanglement position. Reference the position image provided.
```

---

## CHECKLIST — ALL 24 IMAGES

### Section A — Adele on Top (6 remaining of 11)
| # | Position | Filename | Status |
|---|----------|----------|--------|
| A1 | Closed Guard | `Adele Marcus Closed Guard.png` | ✅ Done |
| A2 | Open Guard | `Adele Marcus Open Guard.png` | ✅ Done |
| A3 | Side Control | `Adele Marcus Side Control.png` | ☐ |
| A4 | Mount | `Adele Marcus Mount.png` | ✅ Done |
| A5 | Back Control | `Adele Marcus Back Control.png` | ✅ Done |
| A6 | Turtle | `Adele Marcus Turtle.png` | ☐ |
| A7 | Standing Clinch | `Adele Marcus Standing Clinch.png` | ✅ Done |
| A8 | Knee on Belly | `Adele Marcus Knee on Belly.png` | ☐ |
| A9 | North-South | `Adele Marcus North South.png` | ☐ |
| A10 | Butterfly Guard | `Adele Marcus Butterfly Guard.png` | ☐ |
| A11 | Ashi Garami | `Adele Marcus Ashi Garami.png` | ☐ |

### Section B — Marcus on Top (12 images)
| # | Position | Filename | Status |
|---|----------|----------|--------|
| B0 | Half Guard | `Marcus Adele Half Guard.png` | ☐ |
| B1 | Closed Guard | `Marcus Adele Closed Guard.png` | ☐ |
| B2 | Open Guard | `Marcus Adele Open Guard.png` | ☐ |
| B3 | Side Control | `Marcus Adele Side Control.png` | ☐ |
| B4 | Mount | `Marcus Adele Mount.png` | ☐ |
| B5 | Back Control | `Marcus Adele Back Control.png` | ☐ |
| B6 | Turtle | `Marcus Adele Turtle.png` | ☐ |
| B7 | Standing Clinch | `Marcus Adele Standing Clinch.png` | ☐ |
| B8 | Knee on Belly | `Marcus Adele Knee on Belly.png` | ☐ |
| B9 | North-South | `Marcus Adele North South.png` | ☐ |
| B10 | Butterfly Guard | `Marcus Adele Butterfly Guard.png` | ☐ |
| B11 | Ashi Garami | `Marcus Adele Ashi Garami.png` | ☐ |

### Already Complete
| Position | Filename | Status |
|----------|----------|--------|
| Half Guard — Adele Top | `Adele Marcus Half Guard.png` | ✅ Done |
| Closed Guard — Adele Top | `Adele Marcus Closed Guard.png` | ✅ Done |
| Open Guard — Adele Top | `Adele Marcus Open Guard.png` | ✅ Done |
| Mount — Adele Top | `Adele Marcus Mount.png` | ✅ Done |
| Back Control — Adele Top | `Adele Marcus Back Control.png` | ✅ Done |
| Standing Clinch — Adele Top | `Adele Marcus Standing Clinch.png` | ✅ Done |

**TOTAL: 18 remaining + 6 complete = 24 complete position set**

---

## SECTION C — FINISHING POSITIONS (Marcus Attacking)

### C1: REAR NAKED CHOKE — Marcus Attacking
**Filename:** `Marcus Adele Rear Naked Choke.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a rear naked choke finishing position.

MARCUS (attacker, applying the choke) is seated behind Adele with his legs wrapped around her waist (hooks in). His right forearm is locked across Adele's throat and his left hand grips his right wrist in a tight figure-four grip behind her head, squeezing the choke. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, being choked) is seated in front of Marcus, leaning back into him. Her hands are pulling at his choking arm, face showing strain and going red from the choke. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ rear naked choke finish from back control. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### C2: GUILLOTINE — Marcus Attacking
**Filename:** `Marcus Adele Guillotine.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a guillotine choke finishing position.

MARCUS (attacker, applying the guillotine) is standing upright, wrapping his right arm tightly around Adele's neck from the front. Her head is trapped under his armpit. His left hand clasps his right wrist to lock the choke tightly. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, being choked) is bent forward at the waist with her head trapped under Marcus's arm. Her hands are pushing against his torso trying to escape. Face showing strain. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ standing guillotine choke. Both fighters are standing.
```

---

### C3: ARMBAR — Marcus Attacking
**Filename:** `Marcus Adele Armbar.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in an armbar finishing position.

MARCUS (attacker, applying the armbar) is on his back on the ground with Adele's right arm trapped between his thighs. He is extending and hyperextending her arm across his hips while squeezing his knees together. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, arm being attacked) is on her knees beside Marcus, her right arm caught and being hyperextended. Her face shows pain and strain. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ armbar finish. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### C4: KIMURA — Marcus Attacking
**Filename:** `Marcus Adele Kimura.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a kimura finishing position.

MARCUS (attacker, applying the kimura) is in side control position on top, gripping Adele's left wrist with both hands in a figure-four grip (double wrist lock), cranking her arm behind her back. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, arm being attacked) is flat on her back, her left arm being cranked behind her back by Marcus. Her face shows pain. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ kimura lock from side control. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### C5: LEG LOCK — Marcus Attacking
**Filename:** `Marcus Adele Leg Lock.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a leg lock finishing position.

MARCUS (attacker, applying the leg lock) is on his back on the ground, controlling Adele's right leg in a tight entanglement. His legs are tangled around hers in an ashi garami position. He grips her foot with both hands in a heel hook grip, twisting her foot to apply the submission. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, leg being attacked) is on the ground trying to pull her leg free, face showing pain and strain. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ heel hook leg lock finish. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### C6: ARM TRIANGLE — Marcus Attacking
**Filename:** `Marcus Adele Arm Triangle.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in an arm triangle choke finishing position.

MARCUS (attacker, applying the arm triangle) is in mount or side control on top, wrapping his right arm under Adele's neck and around her trapped right arm in a head-and-arm choke (kata gatame). His hands are locked in a figure-four grip, squeezing the choke tight. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, being choked) is flat on her back underneath Marcus, her right arm trapped beside her own head, face showing strain and going red from the choke, left hand pushing weakly at Marcus. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ arm triangle choke finish from mount. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### C7: TRIANGLE CHOKE — Marcus Attacking
**Filename:** `Marcus Adele Triangle Choke.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a triangle choke finishing position.

MARCUS (attacker, applying the triangle) is on his back on the ground. His legs are wrapped high around Adele's head and one of her arms, locking his ankles in a figure-four triangle formation, squeezing tightly. He is pulling down on Adele's head with both hands to tighten the choke. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

ADELE (defender, being choked) is on her knees, hunched forward with her head and one arm trapped inside Marcus's triangle. Her face shows strain and is turning red. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

Both fighters fill the frame. Anatomically correct BJJ triangle choke from closed guard. Ground grappling — both fighters are on the ground, NOT standing.
```

---

## SECTION D — FINISHING POSITIONS (Adele Attacking)

### D1: REAR NAKED CHOKE — Adele Attacking
**Filename:** `Adele Marcus Rear Naked Choke.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a rear naked choke finishing position.

ADELE (attacker, applying the choke) is seated behind Marcus with her legs wrapped around his waist (hooks in). Her right forearm is locked across Marcus's throat and her left hand grips her right wrist in a tight figure-four grip behind his head, squeezing the choke. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, being choked) is seated in front of Adele, leaning back into her. His hands are pulling at her choking arm, face showing strain and turning red. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ rear naked choke finish from back control. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### D2: GUILLOTINE — Adele Attacking
**Filename:** `Adele Marcus Guillotine.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a guillotine choke finishing position.

ADELE (attacker, applying the guillotine) is standing upright, wrapping her right arm tightly around Marcus's neck from the front. His head is trapped under her armpit. Her left hand clasps her right wrist to lock the choke tightly. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, being choked) is bent forward at the waist with his head trapped under Adele's arm. His hands are pushing against her torso trying to escape. Face showing strain. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ standing guillotine choke. Both fighters are standing.
```

---

### D3: ARMBAR — Adele Attacking
**Filename:** `Adele Marcus Armbar.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in an armbar finishing position.

ADELE (attacker, applying the armbar) is on her back on the ground with Marcus's right arm trapped between her thighs. She is extending and hyperextending his arm across her hips while squeezing her knees together. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, arm being attacked) is on his knees beside Adele, his right arm caught and being hyperextended. His face shows pain and strain. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ armbar finish. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### D4: KIMURA — Adele Attacking
**Filename:** `Adele Marcus Kimura.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a kimura finishing position.

ADELE (attacker, applying the kimura) is in side control position on top, gripping Marcus's left wrist with both hands in a figure-four grip (double wrist lock), cranking his arm behind his back. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, arm being attacked) is flat on his back, his left arm being cranked behind his back by Adele. His face shows pain. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ kimura lock from side control. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### D5: LEG LOCK — Adele Attacking
**Filename:** `Adele Marcus Leg Lock.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a leg lock finishing position.

ADELE (attacker, applying the leg lock) is on her back on the ground, controlling Marcus's right leg in a tight entanglement. Her legs are tangled around his in an ashi garami position. She grips his foot with both hands in a heel hook grip, twisting his foot to apply the submission. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, leg being attacked) is on the ground trying to pull his leg free, face showing pain and strain. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ heel hook leg lock finish. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### D6: ARM TRIANGLE — Adele Attacking
**Filename:** `Adele Marcus Arm Triangle.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in an arm triangle choke finishing position.

ADELE (attacker, applying the arm triangle) is in mount or side control on top, wrapping her right arm under Marcus's neck and around his trapped right arm in a head-and-arm choke (kata gatame). Her hands are locked in a figure-four grip, squeezing the choke tight. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, being choked) is flat on his back underneath Adele, his right arm trapped beside his own head, face showing strain and going red from the choke, left hand pushing weakly at Adele. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ arm triangle choke finish from mount. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### D7: TRIANGLE CHOKE — Adele Attacking
**Filename:** `Adele Marcus Triangle Choke.png`
```
CPS2 16-bit pixel art. Detailed shading, bold black outlines, thick linework. Rich colour with muscle definition and fabric texture. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI. Match the provided reference images exactly for both characters — use the full-body sprites for proportions and outfit, and the face sheets for facial features and hair detail.

Two BJJ fighters in a triangle choke finishing position.

ADELE (attacker, applying the triangle) is on her back on the ground. Her legs are wrapped high around Marcus's head and one of his arms, locking her ankles in a figure-four triangle formation, squeezing tightly. She is pulling down on Marcus's head with both hands to tighten the choke. Athletic curvy build, fair peach skin, long golden-blonde braided ponytail with purple hair tie, blue eyes. Wearing black short-sleeve compression top with neon lime-green accent stripes, black compression shorts with lime-green side stripe, left ankle wrap, bare feet.

MARCUS (defender, being choked) is on his knees, hunched forward with his head and one arm trapped inside Adele's triangle. His face shows strain and is turning red. Massively muscular build, dark orange-brown skin, short black hair, bare chest, dark grey MMA shorts with bold red side panel, black knee pads, black ankle wraps, black fingerless MMA gloves.

Both fighters fill the frame. Anatomically correct BJJ triangle choke from closed guard. Ground grappling — both fighters are on the ground, NOT standing.
```

---

### Section C Checklist — Marcus Attacking Finishes
| # | Position | Filename | Done? |
|---|----------|----------|-------|
| C1 | Rear Naked Choke | `Marcus Adele Rear Naked Choke.png` | ☐ |
| C2 | Guillotine | `Marcus Adele Guillotine.png` | ☐ |
| C3 | Armbar | `Marcus Adele Armbar.png` | ☐ |
| C4 | Kimura | `Marcus Adele Kimura.png` | ☐ |
| C5 | Leg Lock | `Marcus Adele Leg Lock.png` | ☐ |
| C6 | Arm Triangle | `Marcus Adele Arm Triangle.png` | ☐ |
| C7 | Triangle Choke | `Marcus Adele Triangle Choke.png` | ☐ |

### Section D Checklist — Adele Attacking Finishes
| # | Position | Filename | Done? |
|---|----------|----------|-------|
| D1 | Rear Naked Choke | `Adele Marcus Rear Naked Choke.png` | ☐ |
| D2 | Guillotine | `Adele Marcus Guillotine.png` | ☐ |
| D3 | Armbar | `Adele Marcus Armbar.png` | ☐ |
| D4 | Kimura | `Adele Marcus Kimura.png` | ☐ |
| D5 | Leg Lock | `Adele Marcus Leg Lock.png` | ☐ |
| D6 | Arm Triangle | `Adele Marcus Arm Triangle.png` | ☐ |
| D7 | Triangle Choke | `Adele Marcus Triangle Choke.png` | ☐ |

---

## TROUBLESHOOTING REFERENCE

These are additional tips if the auto-review reprompts above aren't resolving the issue:

- **Characters consistently look wrong across multiple images:** Try adding to the start of the prompt: "IMPORTANT: The attached reference images are the DEFINITIVE guide for how these characters look. Match them EXACTLY — skin tone, outfit colours, proportions, facial features, and hair."
- **Braided ponytail keeps going wrong:** Add: "Adele's hair is a thick golden-blonde Dutch braid in a long ponytail with a purple hair tie — it is NOT loose hair, NOT a regular ponytail, NOT short. Reference the face sheet."
- **Art style keeps drifting to 3D or realistic despite retries:** Try rephrasing the style line to: "Retro 16-bit arcade pixel art. Think Super Nintendo / Sega Genesis era sprites. Individual pixels should be visible. This is NOT modern digital art."
- **Position keeps being anatomically wrong despite retries:** Try adding: "If you are unsure about the grappling position, prioritise matching the position reference photo EXACTLY over any interpretation. Copy the body positions, angles, and limb placement from the photo."
