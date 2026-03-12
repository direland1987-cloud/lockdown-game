// ═══════════════════════════════════════════════════════════════
//  LOCKDOWN v5 — UPDATED POSITIONS, MOVES & CHARACTER AFFINITY
//  Apply these changes to lockdown_game.html
// ═══════════════════════════════════════════════════════════════

// ── STEP 1: Update POS constants (add ASHI_GARAMI) ──
const POS = {
  STANDING:"Standing", CLINCH:"Clinch", OPEN_GUARD:"Open Guard",
  BUTTERFLY_GUARD:"Butterfly Guard", GUARD:"Closed Guard",
  HALF_GUARD:"Half Guard", SIDE_CONTROL:"Side Control",
  TURTLE:"Turtle", MOUNT:"Mount", BACK_CONTROL:"Back Control",
  ASHI_GARAMI:"Ashi Garami",  // ← NEW
  SCRAMBLE:"Scramble"
};

// ── STEP 2: Update POS_DOM (add Ashi Garami dominance) ──
const POS_DOM = {
  [POS.STANDING]:0, [POS.CLINCH]:1, [POS.SCRAMBLE]:0,
  [POS.OPEN_GUARD]:0.5,
  [POS.BUTTERFLY_GUARD]:1,
  [POS.GUARD]:1,
  [POS.HALF_GUARD]:2,
  [POS.TURTLE]:3,
  [POS.SIDE_CONTROL]:3,
  [POS.MOUNT]:4,
  [POS.BACK_CONTROL]:5,
  [POS.ASHI_GARAMI]:2,  // ← NEW — entangler has moderate advantage
};

// ── STEP 3: Character Positional Affinity System ──
// Multiplier applied to statBonus in minigames + AI move weighting
// Key format: "position:role" where role = "top" or "bottom" or "any"
const POS_AFFINITY = {
  marcus: {
    // Top-heavy wrestler — king of takedowns, passing, and top pressure
    "Standing:any": 1.3, "Clinch:any": 1.3,
    "Closed Guard:top": 1.15, "Closed Guard:bottom": 0.7,
    "Open Guard:top": 1.15, "Open Guard:bottom": 0.7,
    "Butterfly Guard:top": 1.0, "Butterfly Guard:bottom": 0.7,
    "Half Guard:top": 1.15, "Half Guard:bottom": 0.85,
    "Side Control:top": 1.3, "Side Control:bottom": 0.85,
    "Mount:top": 1.3, "Mount:bottom": 0.85,
    "Back Control:top": 1.0, "Back Control:bottom": 0.85,
    "Turtle:top": 1.15, "Turtle:bottom": 0.85,
    "Ashi Garami:top": 0.7, "Ashi Garami:bottom": 1.0,
    "Scramble:any": 1.15,
  },
  // Adele — future character, included for completeness
  adele: {
    // Guard player / leg lock specialist — lethal from bottom and ashi
    "Standing:any": 0.85, "Clinch:any": 0.85,
    "Closed Guard:top": 0.85, "Closed Guard:bottom": 1.3,
    "Open Guard:top": 0.85, "Open Guard:bottom": 1.3,
    "Butterfly Guard:top": 0.85, "Butterfly Guard:bottom": 1.15,
    "Half Guard:top": 0.85, "Half Guard:bottom": 1.15,
    "Side Control:top": 0.85, "Side Control:bottom": 1.0,
    "Mount:top": 0.7, "Mount:bottom": 1.0,
    "Back Control:top": 1.3, "Back Control:bottom": 1.0,
    "Turtle:top": 0.85, "Turtle:bottom": 1.0,
    "Ashi Garami:top": 1.3, "Ashi Garami:bottom": 0.85,
    "Scramble:any": 1.0,
  },
  yuki: {
    // Technical guard player / hybrid — spider guard specialist, good escapes
    "Standing:any": 0.85, "Clinch:any": 0.85,
    "Closed Guard:top": 1.0, "Closed Guard:bottom": 1.15,
    "Open Guard:top": 1.0, "Open Guard:bottom": 1.3,
    "Butterfly Guard:top": 1.0, "Butterfly Guard:bottom": 1.15,
    "Half Guard:top": 1.0, "Half Guard:bottom": 1.15,
    "Side Control:top": 1.0, "Side Control:bottom": 1.15,
    "Mount:top": 0.85, "Mount:bottom": 1.15,
    "Back Control:top": 1.15, "Back Control:bottom": 1.15,
    "Turtle:top": 1.0, "Turtle:bottom": 1.15,
    "Ashi Garami:top": 1.0, "Ashi Garami:bottom": 1.0,
    "Scramble:any": 1.15,
  },
  darius: {
    // Counter fighter / escape artist — elite at escaping, decent everywhere
    "Standing:any": 1.0, "Clinch:any": 1.0,
    "Closed Guard:top": 1.0, "Closed Guard:bottom": 1.0,
    "Open Guard:top": 1.0, "Open Guard:bottom": 1.0,
    "Butterfly Guard:top": 1.0, "Butterfly Guard:bottom": 1.0,
    "Half Guard:top": 1.0, "Half Guard:bottom": 1.15,
    "Side Control:top": 1.0, "Side Control:bottom": 1.3,
    "Mount:top": 1.0, "Mount:bottom": 1.3,
    "Back Control:top": 1.0, "Back Control:bottom": 1.3,
    "Turtle:top": 1.0, "Turtle:bottom": 1.3,
    "Ashi Garami:top": 0.85, "Ashi Garami:bottom": 1.15,
    "Scramble:any": 1.15,
  },
  diego: {
    // Wild card scrambler — chaos, inversions, heel hooks from nowhere
    "Standing:any": 1.0, "Clinch:any": 0.85,
    "Closed Guard:top": 0.85, "Closed Guard:bottom": 1.0,
    "Open Guard:top": 1.0, "Open Guard:bottom": 1.15,
    "Butterfly Guard:top": 1.0, "Butterfly Guard:bottom": 1.15,
    "Half Guard:top": 0.85, "Half Guard:bottom": 1.0,
    "Side Control:top": 0.85, "Side Control:bottom": 0.85,
    "Mount:top": 0.85, "Mount:bottom": 0.85,
    "Back Control:top": 1.0, "Back Control:bottom": 0.85,
    "Turtle:top": 0.85, "Turtle:bottom": 1.0,
    "Ashi Garami:top": 1.3, "Ashi Garami:bottom": 1.0,
    "Scramble:any": 1.3,
  },
};

// Helper to get affinity multiplier
function getAffinity(charId, position, isOnTop) {
  const id = charId?.replace("_alt", "");
  const charAff = POS_AFFINITY[id];
  if (!charAff) return 1.0;
  const role = isNeutralPos(position) ? "any" : (isOnTop ? "top" : "bottom");
  return charAff[`${position}:${role}`] || charAff[`${position}:any`] || 1.0;
}


// ── STEP 4: Updated POS_LAYOUT (add Ashi Garami) ──
// Add to existing POS_LAYOUT:
//   [POS.ASHI_GARAMI]: {
//     top: {x:55, y:58, z:2, sz:175, rot:-8},
//     btm: {x:45, y:58, z:1, sz:175, rot:12}
//   },


// ── STEP 5: Updated POS_MAP_DATA (add Ashi Garami) ──
// Add to existing POS_MAP_DATA:
//   [POS.ASHI_GARAMI]: {x:90, y:66, emoji:"🦵"},


// ── STEP 6: Updated POS_LINKS (add Ashi connections) ──
// Add to existing POS_LINKS:
//   [POS.GUARD, POS.ASHI_GARAMI],
//   [POS.OPEN_GUARD, POS.ASHI_GARAMI],
//   [POS.HALF_GUARD, POS.ASHI_GARAMI],
//   [POS.BUTTERFLY_GUARD, POS.ASHI_GARAMI],
//   [POS.SIDE_CONTROL, POS.ASHI_GARAMI],
//   [POS.SCRAMBLE, POS.ASHI_GARAMI],
//   [POS.GUARD, POS.BACK_CONTROL],  // bottom guard → back take


// ═══════════════════════════════════════════════════════════════
//  STEP 7: COMPLETE UPDATED MOVES
//  Key changes marked with // ← CHANGED or // ← NEW
// ═══════════════════════════════════════════════════════════════

const MOVES = {
  [POS.STANDING]: [
    { name:"Double Leg Takedown", type:"sequence", stat:"takedowns", cost:12, dmg:8, desc:"Shoot in and drive through", target:POS.SIDE_CONTROL, from:"any", attackerTop:true, defendable:"takedown" },
    { name:"Single Leg", type:"power", stat:"takedowns", cost:10, dmg:6, desc:"Grab a leg and finish", target:POS.HALF_GUARD, from:"any", attackerTop:true, defendable:"takedown" },
    { name:"Snap Down", type:"timing", stat:"takedowns", cost:8, dmg:4, desc:"Snap head down, take the clinch", target:POS.CLINCH, from:"any", attackerTop:null },
    { name:"Arm Drag to Back", type:"tap", stat:"speed", cost:14, dmg:5, desc:"Drag the arm and circle behind", target:POS.BACK_CONTROL, from:"any", attackerTop:true, defendable:"takedown" },
    { name:"Pull Guard", type:"timing", stat:"guard", cost:6, dmg:0, desc:"Sit to guard — you go to bottom", target:POS.GUARD, from:"any", attackerTop:false },
    // SPECIALS
    { name:"💥 The Freight Train", type:"sequence", stat:"takedowns", cost:14, dmg:12, desc:"Explosive double-leg, 2-stage drive", target:POS.SIDE_CONTROL, from:"any", attackerTop:true, defendable:"takedown", special:"marcus" },
    { name:"💥 Flying Armbar", type:"timing", stat:"speed", cost:18, dmg:0, desc:"Leap and lock! Bypasses all positions", target:null, from:"any", isSub:true, subName:"Flying Armbar", special:"diego" },
  ],

  [POS.CLINCH]: [
    { name:"Body Lock Takedown", type:"power", stat:"takedowns", cost:14, dmg:10, desc:"Lock the body and dump them", target:POS.SIDE_CONTROL, from:"any", attackerTop:true, defendable:"takedown" },
    { name:"Knee Tap", type:"timing", stat:"takedowns", cost:8, dmg:6, desc:"Tap the knee and drive", target:POS.HALF_GUARD, from:"any", attackerTop:true, defendable:"takedown" },
    { name:"Guillotine", type:"sequence", stat:"submissions", cost:16, dmg:0, desc:"Lock the head and squeeze", target:null, from:"any", isSub:true, subName:"Guillotine Choke" },
    { name:"Disengage", type:"timing", stat:"escapes", cost:4, dmg:0, desc:"Push off and reset to standing", target:POS.STANDING, from:"any", attackerTop:null },
    // SPECIALS
    { name:"💥 Flying Armbar", type:"timing", stat:"speed", cost:18, dmg:0, desc:"Leap and lock! Bypasses all positions", target:null, from:"any", isSub:true, subName:"Flying Armbar", special:"diego" },
  ],

  [POS.GUARD]: [
    // ── BOTTOM (guard player) ──
    { name:"Triangle Choke", type:"sequence", stat:"submissions", cost:14, dmg:0, desc:"Lock the triangle and squeeze", target:null, from:"bottom", isSub:true, subName:"Triangle Choke" },
    { name:"Armbar", type:"timing", stat:"submissions", cost:14, dmg:0, desc:"Isolate the arm and extend", target:null, from:"bottom", isSub:true, subName:"Armbar" },
    { name:"Hip Bump Sweep", type:"power", stat:"strength", cost:10, dmg:6, desc:"Bump hips and sweep to top", target:POS.MOUNT, from:"bottom", attackerTop:true, defendable:"sweep" },
    { name:"Scissor Sweep", type:"timing", stat:"guard", cost:8, dmg:4, desc:"Scissor the legs and sweep", target:POS.SIDE_CONTROL, from:"bottom", attackerTop:true, defendable:"sweep" },
    { name:"Stand Up", type:"tap", stat:"speed", cost:8, dmg:0, desc:"Technical stand up to feet", target:POS.STANDING, from:"bottom", attackerTop:null },
    { name:"Open Guard", type:"timing", stat:"guard", cost:3, dmg:0, desc:"Open the legs, create distance", target:POS.OPEN_GUARD, from:"bottom", attackerTop:false },
    { name:"Ashi Entry", type:"sequence", stat:"guard", cost:12, dmg:2, desc:"Dive on the legs — leg lock territory", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW
    { name:"Back Take", type:"sequence", stat:"guard", cost:14, dmg:4, desc:"Climb to the back from guard", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true, defendable:"advance" },  // ← NEW — high risk/reward

    // ── TOP (in opponent's closed guard) ──  // ← CHANGED: no submissions for top in closed guard
    { name:"Open the Guard", type:"timing", stat:"passing", cost:6, dmg:2, desc:"Break the guard open", target:POS.OPEN_GUARD, from:"top", attackerTop:true },  // ← NEW
    { name:"Stack Pass", type:"sequence", stat:"passing", cost:14, dmg:8, desc:"Stack and smash straight through", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },  // ← NEW — high risk/reward
    { name:"Stand Up in Guard", type:"tap", stat:"strength", cost:8, dmg:2, desc:"Posture up and stand to open", target:POS.OPEN_GUARD, from:"top", attackerTop:true },  // ← NEW
    { name:"Posture & Pressure", type:"tap", stat:"strength", cost:4, dmg:6, desc:"Maintain posture, grind", target:POS.GUARD, from:"top", attackerTop:true },

    // SPECIALS
    { name:"💥 The Web", type:"timing", stat:"submissions", cost:16, dmg:0, desc:"Triple-threat: triangle/armbar/omoplata", target:null, from:"bottom", isSub:true, subName:"The Web (Triangle)", special:"yuki" },
    { name:"💥 Rubber Guard Lockdown", type:"timing", stat:"guard", cost:8, dmg:12, desc:"Immobilize and drain from bottom", target:POS.GUARD, from:"bottom", attackerTop:false, special:"yuki", specialEffect:{drainPassing:2} },
    { name:"💥 Bulldozer Pass", type:"sequence", stat:"passing", cost:16, dmg:8, desc:"Unstoppable pressure pass straight to mount", target:POS.MOUNT, from:"top", attackerTop:true, defendable:"pass", special:"marcus" },
  ],

  [POS.OPEN_GUARD]: [
    // ── BOTTOM ──
    { name:"Technical Stand Up", type:"tap", stat:"speed", cost:6, dmg:0, desc:"Stand up and reset", target:POS.STANDING, from:"bottom", attackerTop:null },
    { name:"Pull to Closed Guard", type:"timing", stat:"guard", cost:4, dmg:0, desc:"Close the guard up", target:POS.GUARD, from:"bottom", attackerTop:false },
    { name:"Transition to Butterfly", type:"timing", stat:"guard", cost:4, dmg:0, desc:"Insert butterfly hooks", target:POS.BUTTERFLY_GUARD, from:"bottom", attackerTop:false },
    { name:"Sweep to Top", type:"power", stat:"guard", cost:10, dmg:4, desc:"Off-balance and come on top", target:POS.SIDE_CONTROL, from:"bottom", attackerTop:true, defendable:"sweep" },
    { name:"Heel Hook Entry", type:"sequence", stat:"submissions", cost:16, dmg:0, desc:"Dive on the legs and attack", target:null, from:"bottom", isSub:true, subName:"Heel Hook" },
    { name:"Ashi Entry", type:"timing", stat:"guard", cost:10, dmg:2, desc:"Entangle the legs", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW
    { name:"Back Take", type:"sequence", stat:"guard", cost:14, dmg:4, desc:"Invert or arm drag to back", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true, defendable:"advance" },  // ← NEW

    // ── TOP — passing styles ──
    { name:"Torreando Pass", type:"sequence", stat:"passing", cost:10, dmg:4, desc:"Grab the legs and bull-pass", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },
    { name:"Bodylock Pass", type:"power", stat:"passing", cost:12, dmg:6, desc:"Lock the body and smash through", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },  // ← NEW
    { name:"Knee Cut", type:"timing", stat:"passing", cost:9, dmg:4, desc:"Slice the knee through and pass", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },  // ← NEW
    { name:"Leg Drag", type:"power", stat:"passing", cost:10, dmg:6, desc:"Drag the legs and pass", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },
    { name:"Step Into Half Guard", type:"timing", stat:"passing", cost:6, dmg:2, desc:"Engage and work through half", target:POS.HALF_GUARD, from:"top", attackerTop:true },

    // SPECIALS
    { name:"💥 Berimbolo", type:"sequence", stat:"guard", cost:14, dmg:4, desc:"Invert and take the back!", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true, special:"yuki" },
  ],

  [POS.BUTTERFLY_GUARD]: [
    // ── BOTTOM ──
    { name:"Butterfly Sweep", type:"power", stat:"guard", cost:8, dmg:4, desc:"Hook and elevate to top", target:POS.SIDE_CONTROL, from:"bottom", attackerTop:true, defendable:"sweep" },
    { name:"Guillotine from Butterfly", type:"timing", stat:"submissions", cost:14, dmg:0, desc:"Snap the head down and lock", target:null, from:"bottom", isSub:true, subName:"Guillotine Choke" },
    { name:"Arm Drag to Back", type:"sequence", stat:"speed", cost:12, dmg:4, desc:"Arm drag and circle to back", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true },
    { name:"Transition to Closed Guard", type:"timing", stat:"guard", cost:4, dmg:0, desc:"Lock ankles behind their back", target:POS.GUARD, from:"bottom", attackerTop:false },
    { name:"Ashi Entry", type:"timing", stat:"guard", cost:10, dmg:2, desc:"Dive under for leg entanglement", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW

    // ── TOP ──
    { name:"Smash & Flatten", type:"power", stat:"passing", cost:10, dmg:6, desc:"Kill the hooks and smash through", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },
    { name:"Backstep Pass", type:"timing", stat:"passing", cost:10, dmg:4, desc:"Backstep around the legs", target:POS.HALF_GUARD, from:"top", attackerTop:true, defendable:"pass" },
    { name:"Knee Slice", type:"sequence", stat:"passing", cost:8, dmg:4, desc:"Slice the knee through and pass", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },

    // SPECIALS
    { name:"💥 Berimbolo", type:"sequence", stat:"guard", cost:14, dmg:4, desc:"Invert and take the back!", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true, special:"yuki" },
  ],

  [POS.HALF_GUARD]: [
    // ── BOTTOM ──
    { name:"Kimura", type:"power", stat:"submissions", cost:14, dmg:0, desc:"Double wrist lock on far arm", target:null, from:"bottom", isSub:true, subName:"Kimura" },
    { name:"Underhook Sweep", type:"timing", stat:"strength", cost:10, dmg:6, desc:"Underhook and come on top", target:POS.SIDE_CONTROL, from:"bottom", attackerTop:true, defendable:"sweep" },
    { name:"Lockdown Sweep", type:"sequence", stat:"guard", cost:12, dmg:8, desc:"Electric chair sweep to side control", target:POS.SIDE_CONTROL, from:"bottom", attackerTop:true, defendable:"sweep" },
    { name:"Recover Guard", type:"timing", stat:"guard", cost:6, dmg:0, desc:"Shrimp and recover full guard", target:POS.GUARD, from:"bottom", attackerTop:false },
    { name:"Ashi Entry", type:"sequence", stat:"guard", cost:12, dmg:2, desc:"Thread legs into entanglement", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW
    { name:"Back Take", type:"sequence", stat:"guard", cost:14, dmg:4, desc:"Underhook to back control", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true, defendable:"advance" },  // ← NEW

    // ── TOP ──
    { name:"Pass to Side", type:"power", stat:"passing", cost:10, dmg:6, desc:"Free the leg and pass", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, defendable:"pass" },
    { name:"Pass to Mount", type:"sequence", stat:"passing", cost:14, dmg:8, desc:"Slide knee through to mount", target:POS.MOUNT, from:"top", attackerTop:true, defendable:"pass" },
    { name:"Crush Pressure", type:"tap", stat:"strength", cost:5, dmg:8, desc:"Heavy crossface pressure", target:POS.HALF_GUARD, from:"top", attackerTop:true },
  ],

  [POS.SIDE_CONTROL]: [
    // ── TOP ──
    { name:"Americana", type:"power", stat:"submissions", cost:12, dmg:0, desc:"Paint brush for the keylock", target:null, from:"top", isSub:true, subName:"Americana" },
    { name:"Arm Triangle", type:"sequence", stat:"submissions", cost:14, dmg:0, desc:"Trap head and arm, squeeze", target:null, from:"top", isSub:true, subName:"Arm Triangle" },  // ← NEW
    { name:"Mount Transition", type:"timing", stat:"passing", cost:8, dmg:4, desc:"Slide knee over to mount", target:POS.MOUNT, from:"top", attackerTop:true, defendable:"advance" },
    { name:"Take the Back", type:"sequence", stat:"passing", cost:12, dmg:6, desc:"Spin behind for back control", target:POS.BACK_CONTROL, from:"top", attackerTop:true, defendable:"advance" },
    { name:"Knee on Belly", type:"tap", stat:"strength", cost:6, dmg:10, desc:"Drive knee into belly", target:POS.SIDE_CONTROL, from:"top", attackerTop:true },

    // ── BOTTOM ──
    { name:"Escape to Guard", type:"timing", stat:"escapes", cost:8, dmg:0, desc:"Shrimp and recover guard", target:POS.GUARD, from:"bottom", attackerTop:false },
    { name:"Escape to Feet", type:"tap", stat:"escapes", cost:10, dmg:0, desc:"Frame, hip escape, stand up", target:POS.STANDING, from:"bottom", attackerTop:null },
    { name:"Reguard to Half", type:"timing", stat:"escapes", cost:6, dmg:0, desc:"Get a knee in for half guard", target:POS.HALF_GUARD, from:"bottom", attackerTop:false },
    { name:"Ashi Entry", type:"sequence", stat:"guard", cost:14, dmg:2, desc:"Shoot legs in for leg entanglement", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW
    { name:"Back Take", type:"sequence", stat:"escapes", cost:16, dmg:4, desc:"Spin under to take the back", target:POS.BACK_CONTROL, from:"bottom", attackerTop:true, defendable:"advance" },  // ← NEW — very high risk/reward

    // SPECIALS
    { name:"💥 Anvil Smash", type:"power", stat:"strength", cost:10, dmg:16, desc:"Devastating ride pressure", target:POS.SIDE_CONTROL, from:"top", attackerTop:true, special:"marcus", specialEffect:{resetMomentum:true} },
  ],

  [POS.TURTLE]: [
    // ── TOP (attacking turtle) ──
    { name:"Take the Back", type:"sequence", stat:"passing", cost:10, dmg:4, desc:"Break down and get hooks in", target:POS.BACK_CONTROL, from:"top", attackerTop:true },
    { name:"Darce Choke", type:"timing", stat:"submissions", cost:14, dmg:0, desc:"Thread the arm and squeeze the neck", target:null, from:"top", isSub:true, subName:"Darce Choke" },
    { name:"Snap Down & Spin", type:"power", stat:"strength", cost:8, dmg:6, desc:"Flatten them and take side control", target:POS.SIDE_CONTROL, from:"top", attackerTop:true },

    // ── BOTTOM (turtled up) ──
    { name:"Sit Out to Guard", type:"timing", stat:"escapes", cost:8, dmg:0, desc:"Sit through and recover guard", target:POS.GUARD, from:"bottom", attackerTop:false },
    { name:"Granby Roll", type:"sequence", stat:"escapes", cost:10, dmg:0, desc:"Roll through to open guard", target:POS.OPEN_GUARD, from:"bottom", attackerTop:false },
    { name:"Stand Up", type:"tap", stat:"speed", cost:10, dmg:0, desc:"Base up and get to feet", target:POS.STANDING, from:"bottom", attackerTop:null },
    { name:"Ashi Entry", type:"sequence", stat:"guard", cost:14, dmg:2, desc:"Shoot in on the legs from turtle", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW
  ],

  [POS.MOUNT]: [
    // ── TOP (mounted) ──  // ← CHANGED: no cross collar (no-gi), added smother + americana
    { name:"Arm Triangle", type:"sequence", stat:"submissions", cost:14, dmg:0, desc:"Trap head and arm, squeeze the neck", target:null, from:"top", isSub:true, subName:"Arm Triangle" },
    { name:"Mounted Armbar", type:"timing", stat:"submissions", cost:16, dmg:0, desc:"S-mount to armbar finish", target:null, from:"top", isSub:true, subName:"Armbar" },
    { name:"Americana", type:"power", stat:"submissions", cost:12, dmg:0, desc:"Paint brush keylock from mount", target:null, from:"top", isSub:true, subName:"Americana" },  // ← NEW
    { name:"Smother", type:"tap", stat:"strength", cost:3, dmg:8, desc:"Heavy chest pressure, drain stamina", target:POS.MOUNT, from:"top", attackerTop:true },  // ← NEW
    { name:"Heavy Pressure", type:"tap", stat:"strength", cost:4, dmg:10, desc:"Maintain mount and pressure", target:POS.MOUNT, from:"top", attackerTop:true },
    { name:"Take the Back", type:"timing", stat:"passing", cost:10, dmg:4, desc:"When they turn, take the back", target:POS.BACK_CONTROL, from:"top", attackerTop:true, defendable:"advance" },

    // ── BOTTOM (mounted on) ──
    { name:"Trap & Roll", type:"power", stat:"escapes", cost:12, dmg:0, desc:"Bridge and roll to escape", target:POS.GUARD, from:"bottom", attackerTop:true },
    { name:"Elbow Escape", type:"sequence", stat:"escapes", cost:10, dmg:0, desc:"Shrimp to half guard", target:POS.HALF_GUARD, from:"bottom", attackerTop:false },
    { name:"Ashi Entry", type:"sequence", stat:"guard", cost:16, dmg:2, desc:"Desperate leg entangle from mount bottom", target:POS.ASHI_GARAMI, from:"bottom", attackerTop:true },  // ← NEW — very high risk from mount bottom

    // SPECIALS
    { name:"💥 Anvil Smash", type:"power", stat:"strength", cost:10, dmg:16, desc:"Crushing mount pressure", target:POS.MOUNT, from:"top", attackerTop:true, special:"marcus", specialEffect:{resetMomentum:true} },
    { name:"💥 Ghost Escape", type:"timing", stat:"escapes", cost:12, dmg:0, desc:"Supernatural escape from ANY position", target:POS.STANDING, from:"bottom", attackerTop:null, special:"darius" },
  ],

  [POS.BACK_CONTROL]: [
    // ── TOP (has the back) ──  // ← CHANGED: removed Bow & Arrow, added Reverse Triangle + Armbar
    { name:"Rear Naked Choke", type:"sequence", stat:"submissions", cost:16, dmg:0, desc:"Sink the hooks and choke", target:null, from:"top", isSub:true, subName:"Rear Naked Choke" },
    { name:"Reverse Triangle", type:"sequence", stat:"submissions", cost:16, dmg:0, desc:"Lock the reverse triangle from back", target:null, from:"top", isSub:true, subName:"Reverse Triangle" },  // ← NEW — sequence = hardest minigame
    { name:"Armbar from Back", type:"timing", stat:"submissions", cost:14, dmg:0, desc:"Transition to armbar from back control", target:null, from:"top", isSub:true, subName:"Armbar" },  // ← NEW
    { name:"Short Choke", type:"power", stat:"submissions", cost:14, dmg:0, desc:"Arm-in choke variation, brutal squeeze", target:null, from:"top", isSub:true, subName:"Short Choke" },
    { name:"Back Pressure", type:"tap", stat:"passing", cost:4, dmg:10, desc:"Maintain back control", target:POS.BACK_CONTROL, from:"top", attackerTop:true },

    // ── BOTTOM (back is taken) ──
    { name:"Turn In Escape", type:"timing", stat:"escapes", cost:10, dmg:0, desc:"Clear hooks, turn to guard", target:POS.GUARD, from:"bottom", attackerTop:false },
    { name:"Slide Out", type:"sequence", stat:"escapes", cost:12, dmg:0, desc:"Strip grips and slide to feet", target:POS.STANDING, from:"bottom", attackerTop:null },
    { name:"Turtle Up", type:"tap", stat:"escapes", cost:6, dmg:0, desc:"Turtle to slow the attack", target:POS.TURTLE, from:"bottom", attackerTop:false },

    // SPECIALS
    { name:"💥 Ghost Escape", type:"timing", stat:"escapes", cost:12, dmg:0, desc:"Supernatural escape from ANY position", target:POS.STANDING, from:"bottom", attackerTop:null, special:"darius" },
  ],

  // ═══════════════════════════════════════════════════════════
  //  ← NEW POSITION: ASHI GARAMI
  // ═══════════════════════════════════════════════════════════
  [POS.ASHI_GARAMI]: [
    // ── TOP (entangler — attacking the legs) ──
    { name:"Outside Heel Hook", type:"sequence", stat:"submissions", cost:16, dmg:0, desc:"Maximum damage — outside rotation", target:null, from:"top", isSub:true, subName:"Outside Heel Hook" },  // sequence = hardest = highest reward
    { name:"Double Trouble", type:"sequence", stat:"submissions", cost:18, dmg:0, desc:"Transition to inside position, inside heel hook", target:null, from:"top", isSub:true, subName:"Inside Heel Hook (Double Trouble)" },  // sequence = hardest
    { name:"Inside Heel Hook", type:"timing", stat:"submissions", cost:14, dmg:0, desc:"Standard inside heel hook attack", target:null, from:"top", isSub:true, subName:"Inside Heel Hook" },  // timing = lower risk than outside
    { name:"Knee Bar", type:"power", stat:"submissions", cost:12, dmg:0, desc:"Extend the knee against the joint", target:null, from:"top", isSub:true, subName:"Knee Bar" },
    { name:"Straight Foot Lock", type:"timing", stat:"submissions", cost:10, dmg:0, desc:"Achilles lock — basic but effective", target:null, from:"top", isSub:true, subName:"Straight Foot Lock" },
    { name:"Leg Control", type:"tap", stat:"guard", cost:3, dmg:6, desc:"Maintain entanglement, wear them down", target:POS.ASHI_GARAMI, from:"top", attackerTop:true },

    // ── BOTTOM (defending leg attacks) ──
    { name:"Kick Free", type:"power", stat:"escapes", cost:10, dmg:0, desc:"Boot free and get to feet", target:POS.STANDING, from:"bottom", attackerTop:null },
    { name:"Recover Guard", type:"timing", stat:"escapes", cost:8, dmg:0, desc:"Disentangle and recover guard", target:POS.OPEN_GUARD, from:"bottom", attackerTop:false },
    { name:"Step Over to Top", type:"sequence", stat:"escapes", cost:12, dmg:4, desc:"Step over and end up in top position", target:POS.SIDE_CONTROL, from:"bottom", attackerTop:true },
    { name:"Counter Leg Lock", type:"timing", stat:"submissions", cost:14, dmg:0, desc:"Counter with your own heel hook!", target:null, from:"bottom", isSub:true, subName:"Heel Hook" },  // the scramble-for-legs counter

    // SPECIALS
    { name:"💥 Loco Roll", type:"power", stat:"submissions", cost:16, dmg:0, desc:"Chaotic inversion into heel hook!", target:null, from:"top", isSub:true, subName:"Loco Roll (Heel Hook)", special:"diego" },
  ],

  [POS.SCRAMBLE]: [
    { name:"Front Headlock", type:"tap", stat:"takedowns", cost:8, dmg:6, desc:"Snatch the head and control", target:POS.CLINCH, from:"any", attackerTop:null },
    { name:"Leg Entangle", type:"sequence", stat:"guard", cost:10, dmg:4, desc:"Dive on the legs", target:POS.ASHI_GARAMI, from:"any", attackerTop:true },  // ← CHANGED: now goes to Ashi Garami
    { name:"Scramble to Top", type:"power", stat:"speed", cost:10, dmg:6, desc:"Win the scramble, end on top", target:POS.SIDE_CONTROL, from:"any", attackerTop:true },
    { name:"Heel Hook", type:"timing", stat:"submissions", cost:16, dmg:0, desc:"Catch the heel in the chaos", target:null, from:"any", isSub:true, subName:"Heel Hook" },
    { name:"Reset Standing", type:"timing", stat:"speed", cost:6, dmg:0, desc:"Disengage and stand", target:POS.STANDING, from:"any", attackerTop:null },
    // SPECIALS
    { name:"💥 Loco Roll", type:"power", stat:"submissions", cost:16, dmg:0, desc:"Chaotic inversion into heel hook!", target:null, from:"any", isSub:true, subName:"Loco Roll (Heel Hook)", special:"diego" },
    { name:"💥 Chaos Engine", type:"tap", stat:"speed", cost:8, dmg:6, desc:"Explosive scramble — resets the world", target:POS.SCRAMBLE, from:"any", attackerTop:null, special:"diego" },
  ],
};


// ═══════════════════════════════════════════════════════════════
//  STEP 8: INTEGRATION — How to apply the affinity system
// ═══════════════════════════════════════════════════════════════

// In the resolveMove function, modify the statBonus calculation:
// BEFORE:
//   const statVal = atkChar.stats[move.stat] || 5;
// AFTER:
//   const rawStat = atkChar.stats[move.stat] || 5;
//   const affinity = getAffinity(atkChar.id, pos, isOnTop);
//   const statVal = Math.round(rawStat * affinity);

// In the AI move selection, weight choices by affinity:
// When scoring moves, multiply the score by getAffinity(aiChar.id, pos, !pOnTop)
// This makes the AI prefer moves in positions where the character is strong

// For defense, use the DEFENDER's affinity:
// const defAffinity = getAffinity(defChar.id, pos, !isOnTop);
// Apply defAffinity to the defense roll


// ═══════════════════════════════════════════════════════════════
//  STEP 9: GRAPPLE_SPRITES — add Ashi Garami mapping
// ═══════════════════════════════════════════════════════════════

// Add to GRAPPLE_SPRITES:
//   [POS.ASHI_GARAMI]: "grapple_ashi",

// Add to getSpriteKey:
//   if (position === POS.ASHI_GARAMI) return isOnTop ? "ashiTop" : "ashiBtm";

// Add to character sprite mappings:
//   ashiTop: "char_idle",    // placeholder until sprites exist
//   ashiBtm: "char_idle",

// Add to posEmojis in the UI:
//   "Ashi Garami": "🦵",
