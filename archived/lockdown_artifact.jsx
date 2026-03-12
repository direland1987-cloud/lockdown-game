import { useState, useEffect, useCallback, useRef } from "react";

/* =================================================================
   ULTRA GRAPPLE FIGHTER: SUBMISSION EDITION
   Turn-Based BJJ Grappling Game
   Multi-pose sprites · Position-aware rendering · Locked chars
   Updated stat system · BJJ-correct positions · State machine arch
   ================================================================= */

// ── INJECT STYLES ──
const STYLE_ID = "lockdown-v4-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    /* ══ BASE KEYFRAMES ══ */
    @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}
    @keyframes heavyShake{0%,100%{transform:translate(0,0)}10%{transform:translate(-12px,4px)}20%{transform:translate(10px,-6px)}30%{transform:translate(-14px,2px)}40%{transform:translate(8px,6px)}50%{transform:translate(-6px,-4px)}60%{transform:translate(10px,2px)}70%{transform:translate(-4px,4px)}80%{transform:translate(6px,-2px)}100%{transform:translate(0,0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-20px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes popIn{0%{opacity:0;transform:scale(0.5)}60%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
    @keyframes bannerIn{0%{opacity:0;transform:scale(0.3) rotate(-3deg)}50%{transform:scale(1.08) rotate(0.5deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
    @keyframes gripPulse{0%,100%{box-shadow:0 0 10px rgba(234,179,8,0.3)}50%{box-shadow:0 0 30px rgba(234,179,8,0.6)}}

    /* ══ FIGHTER SPRITE ANIMATIONS ══ */
    @keyframes breatheA{0%,100%{transform:translateY(0) scale(1)}30%{transform:translateY(-3px) scale(1.01)}70%{transform:translateY(-1px) scale(1.005)}}
    @keyframes breatheB{0%,100%{transform:translateY(-1px) scale(1.01)}50%{transform:translateY(1px) scale(1)}}
    @keyframes hitRecoil{0%{transform:translateX(0) scale(1);filter:brightness(1)}15%{transform:translateX(-16px) rotate(-4deg) scale(0.95);filter:brightness(2.5)}30%{transform:translateX(10px) rotate(2deg);filter:brightness(1)}50%{transform:translateX(-6px) rotate(-1deg);filter:brightness(1.3)}100%{transform:translateX(0) scale(1);filter:brightness(1)}}
    @keyframes winCelebrate{0%{transform:translateY(0) scale(1)}20%{transform:translateY(-16px) scale(1.1)}40%{transform:translateY(-8px) scale(1.05)}60%{transform:translateY(-12px) scale(1.08)}100%{transform:translateY(0) scale(1)}}
    @keyframes struggle{0%,100%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-3deg) scale(0.98)}75%{transform:rotate(3deg) scale(1.02)}}
    @keyframes effortPulse{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.04);filter:brightness(1.15) drop-shadow(0 0 8px var(--char-color,#fff))}}
    @keyframes tiredSag{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(3px) rotate(-1deg)}}

    /* ══ TRANSITION ANIMATIONS ══ */
    @keyframes crossfadeIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    @keyframes crossfadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.06)}}
    @keyframes attackLunge{0%{transform:translateX(0) scale(1)}40%{transform:translateX(30px) scale(1.08)}100%{transform:translateX(0) scale(1)}}
    @keyframes attackLungeLeft{0%{transform:translateX(0) scale(1)}40%{transform:translateX(-30px) scale(1.08)}100%{transform:translateX(0) scale(1)}}
    @keyframes takedownSlam{0%{transform:translateY(0) scale(1)}30%{transform:translateY(-20px) scale(1.05)}60%{transform:translateY(10px) scale(1.1)}100%{transform:translateY(0) scale(1)}}

    /* ══ SCREEN EFFECTS ══ */
    @keyframes impactFlash{0%{opacity:0.7}100%{opacity:0}}
    @keyframes subZoom{0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}
    @keyframes vignetteIn{from{opacity:0}to{opacity:1}}
    @keyframes slamText{0%{opacity:0;transform:scale(3) rotate(-5deg)}30%{opacity:1;transform:scale(1.1) rotate(1deg)}50%{transform:scale(0.95) rotate(-0.5deg)}70%{transform:scale(1.02) rotate(0)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
    .anim-slamText{animation:slamText .7s cubic-bezier(.22,1,.36,1) both}
    @keyframes speedLine{0%{transform:scaleX(0);opacity:1}100%{transform:scaleX(1);opacity:0}}
    @keyframes dustBurst{0%{transform:scale(0.3) translateY(0);opacity:0.8}100%{transform:scale(1.5) translateY(-20px);opacity:0}}

    /* ══ ANIMATION CLASSES ══ */
    .anim-shake{animation:shake .35s ease-in-out}
    .anim-heavyShake{animation:heavyShake .65s ease-in-out}
    .anim-fadeUp{animation:fadeUp .4s ease-out both}
    .anim-fadeIn{animation:fadeIn .3s ease-out both}
    .anim-slideDown{animation:slideDown .4s cubic-bezier(.34,1.56,.64,1) both}
    .anim-popIn{animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both}
    .anim-bannerIn{animation:bannerIn .5s cubic-bezier(.34,1.56,.64,1) both}
    .anim-gripPulse{animation:gripPulse 1s ease-in-out infinite}

    /* Fighter state classes */
    .anim-breathe{animation:breatheA 3s ease-in-out infinite}
    .anim-breatheB{animation:breatheB 2.5s ease-in-out infinite}
    .anim-hit{animation:hitRecoil .5s cubic-bezier(.25,.46,.45,.94)}
    .anim-celebrate{animation:winCelebrate .7s cubic-bezier(.34,1.56,.64,1)}
    .anim-struggle{animation:struggle .3s ease-in-out infinite}
    .anim-effort{animation:effortPulse 1s ease-in-out infinite}
    .anim-tired{animation:tiredSag 3s ease-in-out infinite}
    .anim-crossfadeIn{animation:crossfadeIn .35s ease-out both}
    .anim-lunge{animation:attackLunge .6s cubic-bezier(.25,.46,.45,.94)}
    .anim-lungeLeft{animation:attackLungeLeft .6s cubic-bezier(.25,.46,.45,.94)}
    .anim-slam{animation:takedownSlam .7s cubic-bezier(.25,.46,.45,.94)}

    /* Screen effects */
    .arena-shake{animation:heavyShake .5s ease-in-out}
    .arena-subZoom{animation:subZoom 2s ease-in-out}
    .impact-flash{position:absolute;inset:0;pointer-events:none;z-index:50;animation:impactFlash .22s ease-out both}

    /* ══ EASTER EGG TOAST ══ */
    @keyframes slideUp{0%{transform:translateY(100px);opacity:0}100%{transform:translateY(0);opacity:1}}
    @keyframes shrink{0%{width:100%}100%{width:0%}}
    .anim-slideUp{animation:slideUp .3s ease-out both}

    /* ══ SPLASH SCREEN — FULL ARCADE MADNESS ══ */
    @keyframes crtBoot{0%{opacity:0;filter:brightness(3)}15%{opacity:1;filter:brightness(2.5)}25%{opacity:0.2;filter:brightness(0)}35%{opacity:1;filter:brightness(2)}45%{opacity:0.4}55%{opacity:1;filter:brightness(1.3)}100%{opacity:1;filter:brightness(1)}}
    @keyframes titleSlam{0%{transform:scale(6) rotate(-8deg);opacity:0;filter:blur(20px) brightness(3)}40%{transform:scale(0.9) rotate(1deg);opacity:1;filter:blur(0) brightness(1.8)}55%{transform:scale(1.15) rotate(-0.5deg);filter:brightness(1.2)}70%{transform:scale(0.97) rotate(0.3deg)}85%{transform:scale(1.03)}100%{transform:scale(1) rotate(0deg);opacity:1;filter:blur(0) brightness(1)}}
    @keyframes subtitleSlam{0%{transform:scaleX(0) scaleY(3);opacity:0;filter:blur(8px)}50%{transform:scaleX(1.2) scaleY(0.85);opacity:1;filter:blur(0)}75%{transform:scaleX(0.95) scaleY(1.05)}100%{transform:scaleX(1) scaleY(1);opacity:1}}
    @keyframes editionReveal{0%{clip-path:inset(0 100% 0 0);opacity:0}40%{clip-path:inset(0 0% 0 0);opacity:1}60%{filter:brightness(2)}100%{filter:brightness(1)}}
    @keyframes titleBreathe{0%,100%{transform:scale(1);filter:brightness(1) drop-shadow(0 0 30px rgba(230,57,70,0.4))}25%{transform:scale(1.02);filter:brightness(1.1) drop-shadow(0 0 50px rgba(230,57,70,0.6))}50%{transform:scale(1);filter:brightness(1.05) drop-shadow(0 0 40px rgba(247,127,0,0.5))}75%{transform:scale(1.01);filter:brightness(1.08) drop-shadow(0 0 45px rgba(6,214,160,0.4))}}
    @keyframes bgShift{0%,100%{background-position:0% 50%}25%{background-position:50% 0%}50%{background-position:100% 50%}75%{background-position:50% 100%}}
    @keyframes lightStreak{0%{transform:translateX(-200%) rotate(-45deg);opacity:0}15%{opacity:1}50%{opacity:0.6}85%{opacity:1}100%{transform:translateX(200%) rotate(-45deg);opacity:0}}
    @keyframes lightStreakV{0%{transform:translateY(-200%) rotate(0deg);opacity:0}20%{opacity:0.8}80%{opacity:0.8}100%{transform:translateY(200%) rotate(0deg);opacity:0}}
    @keyframes speedConverge{0%{transform:translateX(var(--sx)) scaleX(3);opacity:0}50%{opacity:0.7}100%{transform:translateX(0) scaleX(1);opacity:0}}
    @keyframes diagonalSlash{0%{transform:translateX(-150%) rotate(-35deg) scaleY(0.5);opacity:0}30%{opacity:1;transform:translateX(-30%) rotate(-35deg) scaleY(1)}70%{opacity:0.8}100%{transform:translateX(150%) rotate(-35deg) scaleY(0.5);opacity:0}}
    @keyframes ringPulse{0%{transform:scale(0.3);opacity:0.8;border-width:4px}100%{transform:scale(2.5);opacity:0;border-width:1px}}
    @keyframes glowPulse{0%,100%{opacity:0.15}50%{opacity:0.35}}
    @keyframes chromePulse{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
    @keyframes tapFight{0%,100%{transform:scale(1);text-shadow:0 0 20px rgba(234,179,8,0.5)}50%{transform:scale(1.08);text-shadow:0 0 40px rgba(234,179,8,0.9),0 0 80px rgba(234,179,8,0.3)}}
    @keyframes cornerGlow{0%,100%{opacity:0.3;box-shadow:0 0 8px currentColor}50%{opacity:0.8;box-shadow:0 0 20px currentColor,0 0 40px currentColor}}
    @keyframes sparkle{0%{transform:scale(0) rotate(0deg);opacity:1}50%{transform:scale(1) rotate(180deg);opacity:0.8}100%{transform:scale(0) rotate(360deg);opacity:0}}
    @keyframes textGlitch{0%,95%,100%{transform:translate(0,0);clip-path:none}96%{transform:translate(-3px,1px);clip-path:inset(20% 0 60% 0)}97%{transform:translate(3px,-1px);clip-path:inset(60% 0 10% 0)}98%{transform:translate(-1px,2px);clip-path:inset(40% 0 30% 0)}99%{transform:translate(2px,-1px);clip-path:none}}

    /* Sprite transition */
    .sprite-transition{transition:opacity .3s ease, transform .3s ease}

    /* ══ POSE TRANSITION SYSTEM ══ */
    /* Snap (standing↔standing) */
    @keyframes transOutSnap{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.9)}}
    @keyframes transInSnap{0%{opacity:0;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
    .trans-out-snap{animation:transOutSnap .3s ease-out both}
    .trans-in-snap{animation:transInSnap .3s ease-out both}

    /* Drop (standing→ground: takedown) */
    @keyframes transOutDrop{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(30px) scale(0.7) rotate(8deg)}}
    @keyframes transInDrop{0%{opacity:0;transform:translateY(-20px) scale(1.15)}40%{opacity:1;transform:translateY(4px) scale(1.02)}100%{opacity:1;transform:translateY(0) scale(1)}}
    .trans-out-drop{animation:transOutDrop .5s cubic-bezier(.55,.06,.68,.19) both}
    .trans-in-drop{animation:transInDrop .6s cubic-bezier(.22,1,.36,1) both}

    /* Rise (ground→standing: stand up) */
    @keyframes transOutRise{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-15px) scale(0.85)}}
    @keyframes transInRise{0%{opacity:0;transform:translateY(20px) scale(0.85)}50%{opacity:1;transform:translateY(-4px) scale(1.03)}100%{transform:translateY(0) scale(1)}}
    .trans-out-rise{animation:transOutRise .45s ease-in both}
    .trans-in-rise{animation:transInRise .5s cubic-bezier(.22,1,.36,1) both}

    /* Scramble (ground→ground: position change) */
    @keyframes transOutScramble{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(8px,4px) rotate(5deg) scale(0.9)}}
    @keyframes transInScramble{0%{opacity:0;transform:translate(-8px,4px) rotate(-5deg) scale(0.9)}60%{opacity:1;transform:translate(1px,-1px) rotate(0.5deg) scale(1.02)}100%{opacity:1;transform:translate(0,0) rotate(0) scale(1)}}
    .trans-out-scramble{animation:transOutScramble .4s ease-in both}
    .trans-in-scramble{animation:transInScramble .45s cubic-bezier(.22,1,.36,1) both}

    /* Impact (hit reaction) */
    @keyframes transInImpact{0%{transform:translateX(-10px) scale(0.93);filter:brightness(3)}20%{filter:brightness(1.5)}50%{transform:translateX(5px) scale(1.03)}100%{transform:translateX(0) scale(1);filter:brightness(1)}}
    .trans-in-impact{animation:transInImpact .5s cubic-bezier(.25,.46,.45,.94) both}

    /* Victory */
    @keyframes transInVictory{0%{opacity:0;transform:scale(0.5) translateY(10px)}40%{opacity:1;transform:scale(1.12) translateY(-8px)}70%{transform:scale(0.97) translateY(2px)}100%{transform:scale(1) translateY(0)}}
    .trans-in-victory{animation:transInVictory .7s cubic-bezier(.34,1.56,.64,1) both}

    /* ══ DUST PARTICLES ══ */
    @keyframes dustFloat{0%{transform:translate(0,0) scale(1);opacity:0.7}100%{transform:translate(var(--dx,10px),var(--dy,-25px)) scale(0.2);opacity:0}}
    .dust-particle{animation:dustFloat .5s ease-out both}

    /* Speed lines overlay */
    .speed-line{position:absolute;height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent);animation:speedLine .4s ease-out both}

    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#374151;border-radius:4px}
    .ld-body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#030712;color:#e5e7eb}

    /* SF-style character select */
    @keyframes selectIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes selectGlow{0%,100%{filter:drop-shadow(0 0 8px var(--glow-color))}50%{filter:drop-shadow(0 0 20px var(--glow-color))}}
    .char-select-sprite{animation:selectIdle 2s ease-in-out infinite, selectGlow 3s ease-in-out infinite}
    .char-card{transition:all 0.3s cubic-bezier(.34,1.56,.64,1)}
    .char-card:hover{transform:scale(1.03) translateY(-4px)}
    .char-card.selected{transform:scale(1.05) translateY(-6px)}

    /* Arena fighters */
    @keyframes arenaIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    .arena-fighter{image-rendering:pixelated;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.6))}
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const POS = {
  STANDING:"Standing", CLINCH:"Clinch", OPEN_GUARD:"Open Guard",
  BUTTERFLY_GUARD:"Butterfly Guard", GUARD:"Closed Guard",
  HALF_GUARD:"Half Guard", SIDE_CONTROL:"Side Control",
  TURTLE:"Turtle", MOUNT:"Mount", BACK_CONTROL:"Back Control", SCRAMBLE:"Scramble"
};

// BJJ dominance: higher = more dominant top position
const POS_DOM = {
  [POS.STANDING]:0, [POS.CLINCH]:1, [POS.SCRAMBLE]:0,
  [POS.OPEN_GUARD]:0.5,    // Top can pass more easily, bottom has leg entries
  [POS.BUTTERFLY_GUARD]:1,  // Bottom has strong sweeps, fairly even
  [POS.GUARD]:1,            // Top is slightly advantaged (can pass) but bottom has subs
  [POS.HALF_GUARD]:2,       // Top has clear passing advantage
  [POS.TURTLE]:3,           // Top has strong control, can take back
  [POS.SIDE_CONTROL]:3,     // Top has strong control
  [POS.MOUNT]:4,            // Top is very dominant
  [POS.BACK_CONTROL]:5,     // Top (back-taker) is most dominant
};

/* ═══════════════════════════════════════════════════════════════
   SPRITE SYSTEM — Body Archetype & Template Constants (Phase 1)
   ═══════════════════════════════════════════════════════════════ */

const BUILDS = {
  light:  { label:"Light",  scale:0.88, widthMod:0.90, heightMod:0.95, headSize:18 },
  medium: { label:"Medium", scale:1.0,  widthMod:1.0,  heightMod:1.0,  headSize:20 },
  stocky: { label:"Stocky", scale:1.05, widthMod:1.15, heightMod:0.97, headSize:22 },
  lanky:  { label:"Lanky",  scale:1.12, widthMod:0.92, heightMod:1.10, headSize:19 },
};

const TEMPLATE_ZONES = {
  topSkin: { r:255, g:100, b:100 },  // Salmon — top fighter skin
  topGear: { r:100, g:255, b:100 },  // Lime — top fighter shorts
  topBelt: { r:100, g:100, b:255 },  // Blue — top fighter belt
  topHead: { r:255, g:50,  b:50  },  // Bright red — head anchor
  btmSkin: { r:255, g:255, b:100 },  // Yellow — bottom fighter skin
  btmGear: { r:255, g:100, b:255 },  // Magenta — bottom fighter shorts
  btmBelt: { r:100, g:255, b:255 },  // Cyan — bottom fighter belt
  btmHead: { r:255, g:200, b:50  },  // Gold — head anchor
};

// Positions that use template compositing (ground grapple positions)
const TEMPLATE_POSITIONS = [
  POS.GUARD, POS.HALF_GUARD, POS.SIDE_CONTROL, POS.MOUNT, POS.BACK_CONTROL
];

// Map game positions to template image keys
function positionToKey(pos) {
  const map = {
    [POS.GUARD]: "guard",
    [POS.HALF_GUARD]: "halfguard",
    [POS.SIDE_CONTROL]: "sidecontrol",
    [POS.MOUNT]: "mount",
    [POS.BACK_CONTROL]: "backcontrol",
  };
  return map[pos] || null;
}

// Get template name for a grapple position + build pairing
function getGrappleTemplate(position, topBuild, btmBuild) {
  const posKey = positionToKey(position);
  if (!posKey) return null;
  const sizeMatch = (topBuild === btmBuild) ||
    (["light","medium"].includes(topBuild) && ["light","medium"].includes(btmBuild)) ||
    (["stocky","lanky"].includes(topBuild) && ["stocky","lanky"].includes(btmBuild));
  const variant = sizeMatch ? "similar" : "mismatch";
  return `grapple_${posKey}_${variant}`;
}

/* ═══════════════════════════════════════════════════════════════
   HEAD ANCHORS — Position + Build specific head placement (Phase 3)
   ═══════════════════════════════════════════════════════════════ */

const HEAD_ANCHORS = {
  [POS.GUARD]: {
    top: { view:"front",  light:{x:50,y:24,angle:-10}, medium:{x:50,y:22,angle:-10}, stocky:{x:50,y:20,angle:-12}, lanky:{x:50,y:18,angle:-8} },
    btm: { view:"front",  light:{x:50,y:72,angle:0},   medium:{x:50,y:70,angle:0},   stocky:{x:50,y:68,angle:0},   lanky:{x:50,y:66,angle:0} },
  },
  [POS.MOUNT]: {
    top: { view:"front",  light:{x:50,y:22,angle:-5},  medium:{x:50,y:20,angle:-5},  stocky:{x:50,y:18,angle:-8},  lanky:{x:50,y:16,angle:-5} },
    btm: { view:"topDown",light:{x:50,y:64,angle:0},   medium:{x:50,y:62,angle:0},   stocky:{x:50,y:60,angle:0},   lanky:{x:50,y:58,angle:0} },
  },
  [POS.SIDE_CONTROL]: {
    top: { view:"side",   light:{x:46,y:26,angle:-20}, medium:{x:46,y:24,angle:-20}, stocky:{x:46,y:22,angle:-22}, lanky:{x:46,y:20,angle:-18} },
    btm: { view:"side",   light:{x:54,y:66,angle:10},  medium:{x:54,y:64,angle:10},  stocky:{x:54,y:62,angle:8},   lanky:{x:54,y:60,angle:12} },
  },
  [POS.HALF_GUARD]: {
    top: { view:"side",   light:{x:48,y:26,angle:-15}, medium:{x:48,y:24,angle:-15}, stocky:{x:48,y:22,angle:-18}, lanky:{x:48,y:20,angle:-12} },
    btm: { view:"side",   light:{x:52,y:66,angle:5},   medium:{x:52,y:64,angle:5},   stocky:{x:52,y:62,angle:3},   lanky:{x:52,y:60,angle:7} },
  },
  [POS.BACK_CONTROL]: {
    top: { view:"front",  light:{x:48,y:22,angle:-5},  medium:{x:48,y:20,angle:-5},  stocky:{x:48,y:18,angle:-6},  lanky:{x:48,y:16,angle:-4} },
    btm: { view:"back",   light:{x:52,y:58,angle:8},   medium:{x:52,y:56,angle:8},   stocky:{x:52,y:54,angle:6},   lanky:{x:52,y:52,angle:10} },
  },
};

/* ═══════════════════════════════════════════════════════════════
   CHARACTER ROSTER
   ═══════════════════════════════════════════════════════════════ */

const CHARS = [
  { id:"marcus", name:'Marcus "The Bull" Reyes', short:"Marcus", nick:"The Bull", style:"Pressure Wrestler", difficulty:"EASY",
    bio:"Relentless top-pressure grappler. Smothers from top. Great for beginners.",
    color:"#e63946", accent:"#ff6b6b", locked:false,
    build:"stocky",
    palette:{ skin:"#D4956A", hair:"#1a1a1a", shorts:"#e63946", belt:"#8B4513" },
    heads:{}, // Populated in Phase 7 with front/side/topDown/back sprites
    stats:{takedowns:9,guard:4,passing:8,submissions:7,escapes:5,strength:10,speed:8,stamina:9},
    sig:{name:"The Freight Train",type:"sequence",desc:"Double-leg takedown with 2-stage minigame"},
    skin:"#D4956A",hair:"#1a1a1a",shorts:"#e63946",belt:"#8B4513"
  },
  { id:"yuki", name:'Yuki "Spider" Tanaka', short:"Yuki", nick:"Spider", style:"Technical Guard Player", difficulty:"HARD",
    bio:"Technical wizard, most dangerous off her back. Deadly triangles and intricate guard.",
    color:"#7b2ff7", accent:"#b57bff", locked:false,
    build:"light",
    palette:{ skin:"#F5D6B8", hair:"#0a0a2e", shorts:"#7b2ff7", belt:"#6B3FA0" },
    heads:{},
    stats:{takedowns:3,guard:10,passing:5,submissions:10,escapes:8,strength:4,speed:9,stamina:8},
    sig:{name:"The Web",type:"timing",desc:"Triple-threat triangle/armbar/omoplata combo"},
    skin:"#F5D6B8",hair:"#0a0a2e",shorts:"#7b2ff7",belt:"#6B3FA0"
  },
  { id:"darius", name:'Darius "The Ghost" Okeke', short:"Darius", nick:"The Ghost", style:"Counter Fighter", difficulty:"MEDIUM",
    bio:"Patient and elusive. Waits for mistakes, punishes hard. Supernatural escapes.",
    color:"#06d6a0", accent:"#64ffda", locked:true,
    build:"lanky",
    palette:{ skin:"#8B6914", hair:"#0a0a0a", shorts:"#06d6a0", belt:"#2D7A5F" },
    heads:{},
    stats:{takedowns:6,guard:7,passing:6,submissions:7,escapes:10,strength:6,speed:9,stamina:9},
    sig:{name:"Ghost Escape",type:"timing",desc:"Impossible escape from any bottom position"},
    skin:"#8B6914",hair:"#0a0a0a",shorts:"#06d6a0",belt:"#2D7A5F"
  },
  { id:"diego", name:'"Loco" Diego Vega', short:"Diego", nick:"Loco", style:"Wild Card Scrambler", difficulty:"MEDIUM",
    bio:"Unpredictable scrambler. Every position is dangerous. You never know what's coming.",
    color:"#f77f00", accent:"#fca311", locked:true,
    build:"medium",
    palette:{ skin:"#C68642", hair:"#2a1506", shorts:"#f77f00", belt:"#A85E00" },
    heads:{},
    stats:{takedowns:7,guard:7,passing:5,submissions:8,escapes:5,strength:6,speed:10,stamina:8},
    sig:{name:"Loco Roll",type:"power",desc:"Chaotic inversion into a heel hook"},
    skin:"#C68642",hair:"#2a1506",shorts:"#f77f00",belt:"#A85E00"
  },
];

/*
  Move schema:
    name, type (minigame), stat (which char stat helps), cost (stamina),
    dmg (stamina damage to opponent), desc,
    target: destination position (null for subs),
    from: "top" | "bottom" | "any" — who can use this move,
    attackerTop: after success, is the ATTACKER on top? (null = neutral position),
    isSub, subName,
    defendable: "takedown"|"pass"|"sweep"|"advance"|null — defense category
    special: charId — if set, only this character can use it
    specialEffect: object — extra effects for special moves
*/
const MOVES = {
  [POS.STANDING]: [
    { name:"Double Leg Takedown",type:"sequence",stat:"takedowns",cost:12,dmg:8,desc:"Shoot in and drive through",target:POS.SIDE_CONTROL,from:"any",attackerTop:true,defendable:"takedown" },
    { name:"Single Leg",type:"power",stat:"takedowns",cost:10,dmg:6,desc:"Grab a leg and finish",target:POS.HALF_GUARD,from:"any",attackerTop:true,defendable:"takedown" },
    { name:"Snap Down",type:"timing",stat:"takedowns",cost:8,dmg:4,desc:"Snap head down, take the clinch",target:POS.CLINCH,from:"any",attackerTop:null },
    { name:"Arm Drag to Back",type:"tap",stat:"speed",cost:14,dmg:5,desc:"Drag the arm and circle behind",target:POS.BACK_CONTROL,from:"any",attackerTop:true,defendable:"takedown" },
    { name:"Pull Guard",type:"timing",stat:"guard",cost:6,dmg:0,desc:"Sit to guard — you go to bottom",target:POS.GUARD,from:"any",attackerTop:false },
    // SPECIALS
    { name:"💥 The Freight Train",type:"sequence",stat:"takedowns",cost:14,dmg:12,desc:"Explosive double-leg, 2-stage drive",target:POS.SIDE_CONTROL,from:"any",attackerTop:true,defendable:"takedown",special:"marcus" },
    { name:"💥 Flying Armbar",type:"timing",stat:"speed",cost:18,dmg:0,desc:"Leap and lock! Bypasses all positions",target:null,from:"any",isSub:true,subName:"Flying Armbar",special:"diego" },
  ],
  [POS.CLINCH]: [
    { name:"Body Lock Takedown",type:"power",stat:"takedowns",cost:14,dmg:10,desc:"Lock the body and dump them",target:POS.SIDE_CONTROL,from:"any",attackerTop:true,defendable:"takedown" },
    { name:"Knee Tap",type:"timing",stat:"takedowns",cost:8,dmg:6,desc:"Tap the knee and drive",target:POS.HALF_GUARD,from:"any",attackerTop:true,defendable:"takedown" },
    { name:"Guillotine",type:"sequence",stat:"submissions",cost:16,dmg:0,desc:"Lock the head and squeeze",target:null,from:"any",isSub:true,subName:"Guillotine Choke" },
    { name:"Disengage",type:"timing",stat:"escapes",cost:4,dmg:0,desc:"Push off and reset to standing",target:POS.STANDING,from:"any",attackerTop:null },
    // SPECIALS
    { name:"💥 Flying Armbar",type:"timing",stat:"speed",cost:18,dmg:0,desc:"Leap and lock! Bypasses all positions",target:null,from:"any",isSub:true,subName:"Flying Armbar",special:"diego" },
  ],
  [POS.OPEN_GUARD]: [
    // Bottom (guard player)
    { name:"Technical Stand Up",type:"tap",stat:"speed",cost:6,dmg:0,desc:"Stand up and reset",target:POS.STANDING,from:"bottom",attackerTop:null },
    { name:"Pull to Closed Guard",type:"timing",stat:"guard",cost:4,dmg:0,desc:"Close the guard up",target:POS.GUARD,from:"bottom",attackerTop:false },
    { name:"Transition to Butterfly",type:"timing",stat:"guard",cost:4,dmg:0,desc:"Insert butterfly hooks",target:POS.BUTTERFLY_GUARD,from:"bottom",attackerTop:false },
    { name:"Sweep to Top",type:"power",stat:"guard",cost:10,dmg:4,desc:"Off-balance and come on top",target:POS.SIDE_CONTROL,from:"bottom",attackerTop:true,defendable:"sweep" },
    { name:"Heel Hook Entry",type:"sequence",stat:"submissions",cost:16,dmg:0,desc:"Dive on the legs and attack",target:null,from:"bottom",isSub:true,subName:"Heel Hook" },
    // Top
    { name:"Torreando Pass",type:"sequence",stat:"passing",cost:10,dmg:4,desc:"Grab the legs and bull-pass",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Leg Drag",type:"power",stat:"passing",cost:10,dmg:6,desc:"Drag the legs and pass",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Step Into Half Guard",type:"timing",stat:"passing",cost:6,dmg:2,desc:"Engage and work through half",target:POS.HALF_GUARD,from:"top",attackerTop:true },
    // SPECIALS
    { name:"💥 Berimbolo",type:"sequence",stat:"guard",cost:14,dmg:4,desc:"Invert and take the back!",target:POS.BACK_CONTROL,from:"bottom",attackerTop:true,special:"yuki" },
  ],
  [POS.BUTTERFLY_GUARD]: [
    // Bottom
    { name:"Butterfly Sweep",type:"power",stat:"guard",cost:8,dmg:4,desc:"Hook and elevate to top",target:POS.SIDE_CONTROL,from:"bottom",attackerTop:true,defendable:"sweep" },
    { name:"Guillotine from Butterfly",type:"timing",stat:"submissions",cost:14,dmg:0,desc:"Snap the head down and lock",target:null,from:"bottom",isSub:true,subName:"Guillotine Choke" },
    { name:"Arm Drag to Back",type:"sequence",stat:"speed",cost:12,dmg:4,desc:"Arm drag and circle to back",target:POS.BACK_CONTROL,from:"bottom",attackerTop:true },
    { name:"Transition to Closed Guard",type:"timing",stat:"guard",cost:4,dmg:0,desc:"Lock ankles behind their back",target:POS.GUARD,from:"bottom",attackerTop:false },
    // Top
    { name:"Smash & Flatten",type:"power",stat:"passing",cost:10,dmg:6,desc:"Kill the hooks and smash through",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Backstep Pass",type:"timing",stat:"passing",cost:10,dmg:4,desc:"Backstep around the legs",target:POS.HALF_GUARD,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Knee Slice",type:"sequence",stat:"passing",cost:8,dmg:4,desc:"Slice the knee through and pass",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,defendable:"pass" },
    // SPECIALS
    { name:"💥 Berimbolo",type:"sequence",stat:"guard",cost:14,dmg:4,desc:"Invert and take the back!",target:POS.BACK_CONTROL,from:"bottom",attackerTop:true,special:"yuki" },
  ],
  [POS.GUARD]: [
    // Bottom (guard player) moves
    { name:"Triangle Choke",type:"sequence",stat:"submissions",cost:14,dmg:0,desc:"Lock the triangle and squeeze",target:null,from:"bottom",isSub:true,subName:"Triangle Choke" },
    { name:"Armbar",type:"timing",stat:"submissions",cost:14,dmg:0,desc:"Isolate the arm and extend",target:null,from:"bottom",isSub:true,subName:"Armbar" },
    { name:"Hip Bump Sweep",type:"power",stat:"strength",cost:10,dmg:6,desc:"Bump hips and sweep to top",target:POS.MOUNT,from:"bottom",attackerTop:true,defendable:"sweep" },
    { name:"Scissor Sweep",type:"timing",stat:"guard",cost:8,dmg:4,desc:"Scissor the legs and sweep",target:POS.SIDE_CONTROL,from:"bottom",attackerTop:true,defendable:"sweep" },
    { name:"Stand Up",type:"tap",stat:"speed",cost:8,dmg:0,desc:"Technical stand up to feet",target:POS.STANDING,from:"bottom",attackerTop:null },
    { name:"Open Guard Transition",type:"timing",stat:"guard",cost:3,dmg:0,desc:"Open the legs, create distance",target:POS.OPEN_GUARD,from:"bottom",attackerTop:false },
    // Top (in opponent's guard) moves
    { name:"Pass Guard",type:"sequence",stat:"passing",cost:10,dmg:6,desc:"Work through the legs and pass",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Smash Pass",type:"power",stat:"passing",cost:9,dmg:8,desc:"Heavy pressure pass",target:POS.HALF_GUARD,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Posture & Stack",type:"tap",stat:"strength",cost:6,dmg:8,desc:"Posture up and apply stack pressure",target:POS.GUARD,from:"top",attackerTop:true },
    // SPECIALS
    { name:"💥 The Web",type:"timing",stat:"submissions",cost:16,dmg:0,desc:"Triple-threat: triangle/armbar/omoplata",target:null,from:"bottom",isSub:true,subName:"The Web (Triangle)",special:"yuki" },
    { name:"💥 Rubber Guard Lockdown",type:"timing",stat:"guard",cost:8,dmg:12,desc:"Immobilize and drain from bottom",target:POS.GUARD,from:"bottom",attackerTop:false,special:"yuki",specialEffect:{drainPassing:2} },
    { name:"💥 Bulldozer Pass",type:"sequence",stat:"passing",cost:16,dmg:8,desc:"Unstoppable pressure pass straight to mount",target:POS.MOUNT,from:"top",attackerTop:true,defendable:"pass",special:"marcus" },
  ],
  [POS.HALF_GUARD]: [
    // Bottom moves
    { name:"Kimura",type:"power",stat:"submissions",cost:14,dmg:0,desc:"Double wrist lock on far arm",target:null,from:"bottom",isSub:true,subName:"Kimura" },
    { name:"Underhook Sweep",type:"timing",stat:"strength",cost:10,dmg:6,desc:"Underhook and come on top",target:POS.SIDE_CONTROL,from:"bottom",attackerTop:true,defendable:"sweep" },
    { name:"Lockdown Sweep",type:"sequence",stat:"guard",cost:12,dmg:8,desc:"Electric chair sweep to side control",target:POS.SIDE_CONTROL,from:"bottom",attackerTop:true,defendable:"sweep" },
    { name:"Recover Guard",type:"timing",stat:"guard",cost:6,dmg:0,desc:"Shrimp and recover full guard",target:POS.GUARD,from:"bottom",attackerTop:false },
    // Top moves
    { name:"Pass to Side",type:"power",stat:"passing",cost:10,dmg:6,desc:"Free the leg and pass",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Pass to Mount",type:"sequence",stat:"passing",cost:14,dmg:8,desc:"Slide knee through to mount",target:POS.MOUNT,from:"top",attackerTop:true,defendable:"pass" },
    { name:"Crush Pressure",type:"tap",stat:"strength",cost:5,dmg:8,desc:"Heavy crossface pressure",target:POS.HALF_GUARD,from:"top",attackerTop:true },
  ],
  [POS.SIDE_CONTROL]: [
    // Top moves
    { name:"Americana",type:"power",stat:"submissions",cost:12,dmg:0,desc:"Paint brush for the keylock",target:null,from:"top",isSub:true,subName:"Americana" },
    { name:"Mount Transition",type:"timing",stat:"passing",cost:8,dmg:4,desc:"Slide knee over to mount",target:POS.MOUNT,from:"top",attackerTop:true,defendable:"advance" },
    { name:"Take the Back",type:"sequence",stat:"passing",cost:12,dmg:6,desc:"Spin behind for back control",target:POS.BACK_CONTROL,from:"top",attackerTop:true,defendable:"advance" },
    { name:"Knee on Belly",type:"tap",stat:"strength",cost:6,dmg:10,desc:"Drive knee into belly",target:POS.SIDE_CONTROL,from:"top",attackerTop:true },
    // Bottom moves
    { name:"Escape to Guard",type:"timing",stat:"escapes",cost:8,dmg:0,desc:"Shrimp and recover guard",target:POS.GUARD,from:"bottom",attackerTop:false },
    { name:"Escape to Feet",type:"tap",stat:"escapes",cost:10,dmg:0,desc:"Frame, hip escape, stand up",target:POS.STANDING,from:"bottom",attackerTop:null },
    { name:"Reguard to Half",type:"sequence",stat:"escapes",cost:6,dmg:0,desc:"Get a knee in for half guard",target:POS.HALF_GUARD,from:"bottom",attackerTop:false },
    // SPECIALS
    { name:"💥 Anvil Smash",type:"power",stat:"strength",cost:10,dmg:16,desc:"Devastating ride pressure",target:POS.SIDE_CONTROL,from:"top",attackerTop:true,special:"marcus",specialEffect:{resetMomentum:true} },
  ],
  [POS.TURTLE]: [
    // Top moves (attacking turtle)
    { name:"Take the Back",type:"sequence",stat:"passing",cost:10,dmg:4,desc:"Break down and get hooks in",target:POS.BACK_CONTROL,from:"top",attackerTop:true },
    { name:"Darce Choke",type:"timing",stat:"submissions",cost:14,dmg:0,desc:"Thread the arm and squeeze the neck",target:null,from:"top",isSub:true,subName:"Darce Choke" },
    { name:"Snap Down & Spin",type:"power",stat:"strength",cost:8,dmg:6,desc:"Flatten them and take side control",target:POS.SIDE_CONTROL,from:"top",attackerTop:true },
    // Bottom moves (turtled up)
    { name:"Sit Out to Guard",type:"timing",stat:"escapes",cost:8,dmg:0,desc:"Sit through and recover guard",target:POS.GUARD,from:"bottom",attackerTop:false },
    { name:"Granby Roll",type:"sequence",stat:"escapes",cost:10,dmg:0,desc:"Roll through to open guard",target:POS.OPEN_GUARD,from:"bottom",attackerTop:false },
    { name:"Stand Up",type:"tap",stat:"speed",cost:10,dmg:0,desc:"Base up and get to feet",target:POS.STANDING,from:"bottom",attackerTop:null },
  ],
  [POS.MOUNT]: [
    // Top moves (mounted)
    { name:"Arm Triangle",type:"sequence",stat:"submissions",cost:14,dmg:0,desc:"Trap head and arm, squeeze the neck",target:null,from:"top",isSub:true,subName:"Arm Triangle" },
    { name:"Mounted Armbar",type:"timing",stat:"submissions",cost:16,dmg:0,desc:"S-mount to armbar finish",target:null,from:"top",isSub:true,subName:"Armbar" },
    { name:"Heavy Pressure",type:"tap",stat:"strength",cost:4,dmg:10,desc:"Maintain mount and pressure",target:POS.MOUNT,from:"top",attackerTop:true },
    { name:"Take the Back",type:"timing",stat:"passing",cost:10,dmg:4,desc:"When they turn, take the back",target:POS.BACK_CONTROL,from:"top",attackerTop:true,defendable:"advance" },
    // Bottom moves (mounted on)
    { name:"Trap & Roll",type:"power",stat:"escapes",cost:12,dmg:0,desc:"Bridge and roll to escape",target:POS.GUARD,from:"bottom",attackerTop:true },
    { name:"Elbow Escape",type:"sequence",stat:"escapes",cost:10,dmg:0,desc:"Shrimp to half guard",target:POS.HALF_GUARD,from:"bottom",attackerTop:false },
    // SPECIALS
    { name:"💥 Anvil Smash",type:"power",stat:"strength",cost:10,dmg:16,desc:"Crushing mount pressure",target:POS.MOUNT,from:"top",attackerTop:true,special:"marcus",specialEffect:{resetMomentum:true} },
  ],
  [POS.BACK_CONTROL]: [
    // Top moves (has the back)
    { name:"Rear Naked Choke",type:"sequence",stat:"submissions",cost:16,dmg:0,desc:"Sink the hooks and choke",target:null,from:"top",isSub:true,subName:"Rear Naked Choke" },
    { name:"Short Choke",type:"power",stat:"submissions",cost:14,dmg:0,desc:"Arm-in choke variation, brutal squeeze",target:null,from:"top",isSub:true,subName:"Short Choke" },
    { name:"Back Pressure",type:"tap",stat:"passing",cost:4,dmg:10,desc:"Maintain back control",target:POS.BACK_CONTROL,from:"top",attackerTop:true },
    // Bottom moves (back is taken)
    { name:"Turn In Escape",type:"timing",stat:"escapes",cost:10,dmg:0,desc:"Clear hooks, turn to guard",target:POS.GUARD,from:"bottom",attackerTop:false },
    { name:"Slide Out",type:"sequence",stat:"escapes",cost:12,dmg:0,desc:"Strip grips and slide to feet",target:POS.STANDING,from:"bottom",attackerTop:null },
    { name:"Turtle Up",type:"tap",stat:"escapes",cost:6,dmg:0,desc:"Turtle to slow the attack",target:POS.TURTLE,from:"bottom",attackerTop:false },
    // SPECIALS
    { name:"💥 Ghost Escape",type:"timing",stat:"escapes",cost:12,dmg:0,desc:"Supernatural escape from ANY position",target:POS.STANDING,from:"bottom",attackerTop:null,special:"darius" },
  ],
  [POS.SCRAMBLE]: [
    { name:"Front Headlock",type:"tap",stat:"takedowns",cost:8,dmg:6,desc:"Snatch the head and control",target:POS.CLINCH,from:"any",attackerTop:null },
    { name:"Leg Entangle",type:"sequence",stat:"guard",cost:10,dmg:4,desc:"Dive on the legs",target:POS.OPEN_GUARD,from:"any",attackerTop:false },
    { name:"Scramble to Top",type:"power",stat:"speed",cost:10,dmg:6,desc:"Win the scramble, end on top",target:POS.SIDE_CONTROL,from:"any",attackerTop:true },
    { name:"Heel Hook",type:"timing",stat:"submissions",cost:16,dmg:0,desc:"Catch the heel in the chaos",target:null,from:"any",isSub:true,subName:"Heel Hook" },
    { name:"Reset Standing",type:"timing",stat:"speed",cost:6,dmg:0,desc:"Disengage and stand",target:POS.STANDING,from:"any",attackerTop:null },
    // SPECIALS
    { name:"💥 Loco Roll",type:"power",stat:"submissions",cost:16,dmg:0,desc:"Chaotic inversion into heel hook!",target:null,from:"any",isSub:true,subName:"Loco Roll (Heel Hook)",special:"diego" },
    { name:"💥 Chaos Engine",type:"tap",stat:"speed",cost:8,dmg:6,desc:"Explosive scramble — resets the world",target:POS.SCRAMBLE,from:"any",attackerTop:null,special:"diego" },
  ]
};

// Specials that can be used from ANY position (injected dynamically)
const UNIVERSAL_SPECIALS = [
  { name:"💥 Ghost Escape",type:"timing",stat:"escapes",cost:12,dmg:0,desc:"Supernatural escape to feet",target:POS.STANDING,from:"bottom",attackerTop:null,special:"darius" },
  { name:"💥 Phantom Sweep",type:"timing",stat:"escapes",cost:10,dmg:8,desc:"Fake concede, then reverse!",target:POS.SIDE_CONTROL,from:"bottom",attackerTop:true,special:"darius",specialEffect:{punishMomentum:true},defendable:"sweep" },
  { name:"💥 Chaos Engine",type:"tap",stat:"speed",cost:8,dmg:6,desc:"Explosive scramble — resets everything!",target:POS.SCRAMBLE,from:"any",attackerTop:null,special:"diego" },
];

// ── DEFENSE SYSTEM ──
const DEFENSE_CONFIG = {
  takedown: { baseRate:0.40, defStat:"escapes", mgType:"timing", label:"SPRAWL!", desc:"Time your sprawl!" },
  pass:     { baseRate:0.35, defStat:"guard",   mgType:"tap",    label:"RETAIN!", desc:"Fight to keep guard!" },
  sweep:    { baseRate:0.30, defStat:"strength", mgType:"power",  label:"BASE!",   desc:"Post and base out!" },
  advance:  { baseRate:0.25, defStat:"escapes", mgType:"timing", label:"BLOCK!",  desc:"Block the transition!" }
};

function calcDefenseChance(defCfg, attacker, defender, state) {
  const {baseRate, defStat} = defCfg;
  const defStatVal = defender.stats[defStat]||5;
  const atkMom = state.isPlayerAttacking ? state.aMom : state.pMom;
  const defMom = state.isPlayerAttacking ? state.pMom : state.aMom;
  const defStam = state.isPlayerAttacking ? state.aStam : state.pStam;
  const dom = POS_DOM[state.pos]||0;

  // No defense if exhausted, attacker on fire, or PERFECT execution
  if(defStam < 15) return 0;
  if(atkMom >= 3) return 0;
  if(state.score >= 95) return 0; // PERFECT execution = undefendable

  let chance = baseRate;
  // Position modifier
  const defOnTop = state.isPlayerAttacking ? !state.pOnTop : state.pOnTop;
  if(defOnTop) chance += 0.15; // defending from better position
  else chance -= dom * 0.02; // worse position = harder to defend

  // Stamina modifier
  chance += (defStam - 50) * 0.003;
  // Momentum
  chance += (defMom * 0.05) - (atkMom * 0.05);
  // Stat modifier
  chance += (defStatVal - 5) * 0.03;

  return clamp(chance, 0.05, 0.75);
}

// ── EASTER EGGS ──
const EASTER_EGGS = [
  { id:"acai_power",text:"Powered by açaí and delusion",icon:"🥣",chance:0.15,cat:"lifestyle",
    check:(s)=>s.moment==="win"&&s.pStam>=90 },
  { id:"acai_buff",text:"That $18 açaí bowl is paying off",icon:"🫐",chance:0.08,cat:"lifestyle",
    check:(s)=>s.moment==="turn"&&s.pStam>s.aStam&&s.pStam>=70 },
  { id:"pineapple",text:"Don't forget to bring a pineapple 🍍",icon:"🍍",chance:1.0,cat:"gym",oneTime:true,
    check:(s)=>s.moment==="start"&&s.totalFights===0 },
  { id:"cross_pray",text:"🙏 Thank you, Jiu Jitsu Jesus",icon:"✝️",chance:0.20,cat:"lifestyle",
    check:(s)=>s.moment==="sub_escape"&&s.pStam<15 },
  { id:"jj_jesus",text:"Looking up to the heavens! PORRA!",icon:"🙌",chance:1.0,cat:"lifestyle",
    check:(s)=>s.moment==="move"&&s.perfectStreak>=3 },
  { id:"cauliflower",text:"Both fighters now have cauliflower ears",icon:"👂",chance:0.30,cat:"lifestyle",
    check:(s)=>s.moment==="turn"&&s.turnN>=25 },
  { id:"shower_slides",text:"Winner gets first shower. Wear your slides.",icon:"🩴",chance:0.10,cat:"lifestyle",
    check:(s)=>s.moment==="win"&&s.finish==="tko" },
  { id:"dojo_storm",text:"A stranger has entered the gym...",icon:"🌪️",chance:0.25,cat:"gym",
    check:(s)=>s.moment==="start"&&s.diff==="hard" },
  { id:"mat_enforcer",text:"The mat enforcer has been activated",icon:"👊",chance:0.15,cat:"gym",
    check:(s)=>s.moment==="move"&&s.aMom>=3 },
  { id:"5stripe",text:"Congrats on your 5th stripe, white belt",icon:"🤍",chance:1.0,cat:"gym",
    check:(s)=>s.moment==="loss"&&s.lossStreak>=5 },
  { id:"sandbagging",text:"Suspected sandbagging. Investigation pending.",icon:"🏖️",chance:0.30,cat:"gym",
    check:(s)=>s.moment==="win"&&s.diff==="easy"&&s.turnN<6 },
  { id:"creonte",text:"Your old professor is disappointed in you",icon:"😤",chance:0.12,cat:"gym",
    check:(s)=>s.moment==="start"&&s.charSwitched },
  { id:"go_light",text:'They said "let\'s go light"...',icon:"🤥",chance:0.20,cat:"gym",
    check:(s)=>s.moment==="grip_close" },
  { id:"professor",text:"My professor said this would work",icon:"🧑‍🏫",chance:0.15,cat:"gym",
    check:(s)=>s.moment==="move_fail"&&s.moveCost>=14 },
  { id:"wash_belt",text:"Maybe try washing your belt",icon:"🧼",chance:0.10,cat:"gym",
    check:(s)=>s.moment==="start"&&s.streak===0&&s.totalFights>0 },
  { id:"oil_check",text:"That grip placement is... questionable",icon:"😳",chance:0.05,cat:"combat",
    check:(s)=>s.moment==="move"&&s.pos===POS.BACK_CONTROL&&!s.isSub&&s.isOnTop },
  { id:"not_real_bjj",text:"Old school coach is furious right now",icon:"👴",chance:0.20,cat:"combat",
    check:(s)=>s.moment==="sub_finish"&&s.subName?.includes("Heel Hook") },
  { id:"flying_nothing",text:"Ah yes, the famous flying nothing",icon:"🦅",chance:0.25,cat:"combat",
    check:(s)=>s.moment==="move_fail"&&s.moveCost>=16&&isNeutralPos(s.pos) },
  { id:"spazzy",text:"Are you new here? Relax, breathe.",icon:"😵‍💫",chance:1.0,cat:"combat",
    check:(s)=>s.moment==="move_fail"&&s.failStreak>=3 },
  { id:"no_tap",text:"Ego: preserved. Elbow: not so much.",icon:"💪",chance:0.20,cat:"combat",
    check:(s)=>s.moment==="turn"&&s.pStam<5&&!s.wasSubbed },
  { id:"pos_before_sub",text:"Your coach is smiling right now",icon:"🥲",chance:0.25,cat:"combat",
    check:(s)=>s.moment==="move"&&s.posAdvances>=3 },
  { id:"blue_belt_quit",text:"Another blue belt lost to the game...",icon:"🔵",chance:1.0,cat:"combat",
    check:(s)=>s.moment==="quit" },
  { id:"stalling",text:"⚠️ Stalling warning. Referee getting impatient.",icon:"🟡",chance:0.40,cat:"combat",
    check:(s)=>s.moment==="turn"&&s.stallTurns>=4 },
  { id:"twister",text:"Eddie would be proud. Look into it.",icon:"👁️",chance:0.15,cat:"combat",
    check:(s)=>s.moment==="win"&&s.pos===POS.SCRAMBLE },
  { id:"flat_earth",text:"Look into it. That's all I'm saying.",icon:"🌍",chance:0.12,cat:"combat",
    check:(s)=>s.moment==="sub_finish"&&s.charId==="diego"&&s.subName?.includes("Heel Hook") },
  { id:"advantage",text:"That's an advantage at best",icon:"🟨",chance:0.20,cat:"tourney",
    check:(s)=>s.moment==="move"&&s.score>=50&&s.score<=55 },
  { id:"double_guard",text:"Double guard pull. Crowd is booing.",icon:"🥱",chance:0.30,cat:"tourney",
    check:(s)=>s.moment==="move"&&s.moveName==="Pull Guard" },
  { id:"ref_standup",text:"Ref is considering a stand-up... oh wait",icon:"🧑‍⚖️",chance:0.25,cat:"tourney",
    check:(s)=>s.moment==="turn"&&s.pos===POS.STANDING&&s.standingTurns>=2 },
  { id:"marcelotine",text:"The Marcelotine! Beautiful execution.",icon:"🙏",chance:0.20,cat:"tourney",
    check:(s)=>s.moment==="sub_finish"&&s.subName?.includes("Guillotine") },
  { id:"gordon_mode",text:"You're entering Gordon territory",icon:"👑",chance:1.0,cat:"tourney",
    check:(s)=>s.moment==="win"&&s.streak>=5 },
  { id:"chaos_theory",text:"Unorthodox. Unpredictable. Unstoppable.",icon:"🤪",chance:0.15,cat:"tourney",
    check:(s)=>s.moment==="win"&&s.pos===POS.SCRAMBLE },
  { id:"perfect",text:"PERFECT. Flawless grappling.",icon:"⭐",chance:1.0,cat:"arcade",
    check:(s)=>s.moment==="win"&&s.mgLosses===0 },
  { id:"cheese",text:"Spam detected. Try a combo.",icon:"🧀",chance:0.40,cat:"arcade",
    check:(s)=>s.moment==="move"&&s.sameMoveTimes>=3 },
  { id:"quarter_muncher",text:"This machine has eaten $4.50 in quarters",icon:"🪙",chance:1.0,cat:"arcade",
    check:(s)=>s.moment==="loss"&&s.diff==="hard"&&s.hardLosses>=3 },
  { id:"continue",text:"9... 8... 7... INSERT COIN TO CONTINUE",icon:"🕹️",chance:0.15,cat:"arcade",
    check:(s)=>s.moment==="rematch" },
  { id:"instagram",text:"That's going straight on the gram 📸",icon:"📸",chance:0.20,cat:"combat",
    check:(s)=>s.moment==="sub_finish"&&s.pos===POS.SCRAMBLE },
  { id:"tap_early",text:"Wise man once said: tap early, tap often",icon:"🧠",chance:0.12,cat:"combat",
    check:(s)=>s.moment==="sub_escape"&&s.defenseScore>=90 },
  { id:"smesh",text:"Just smesh. That is the plan.",icon:"🔨",chance:0.20,cat:"combat",
    check:(s)=>s.moment==="win"&&s.finish==="tko"&&s.pos===POS.MOUNT },
  { id:"hobbyist",text:"Just a hobbyist btw",icon:"🏠",chance:0.10,cat:"gym",
    check:(s)=>s.moment==="win"&&s.diff==="easy"&&s.pStam>=60 },
  { id:"guard_pull_street",text:"Pulling guard in a street fight. Bold strategy.",icon:"🤔",chance:0.20,cat:"gym",
    check:(s)=>s.moment==="move"&&s.moveName==="Pull Guard" },
  { id:"oss",text:"OSS! Welcome to the gentle art.",icon:"🥋",chance:1.0,cat:"gym",oneTime:true,
    check:(s)=>s.moment==="win"&&s.totalWins===0 },
];

// Rare flavor text alternatives for combat log
const FLAVOR_TEXT = {
  takedown_success: [
    "📺 THAT would make the highlight reel",
    "🎙️ 'OH HE'S HURT!' — the commentary booth is losing it",
    "📊 94% completion rate. Source: trust me bro.",
  ],
  sub_fail: [
    "🐍 Slippery. Must be the excessive body lotion.",
    "💦 Too sweaty. No-gi problems.",
    "🧈 Greased up like a Turkish oil wrestler",
  ],
  escape_success: [
    "🏃 Houdini would be proud",
    "🧘 Years of yoga flexibility paying off",
    "💨 Vanished. Like they were never even there.",
  ],
  low_stamina: [
    "😮‍💨 Should have done more cardio",
    "🫁 Breathing like they just discovered oxygen",
    "🥵 Regretting that pizza before class",
  ],
  perfect_mg: [
    "🎯 Clean technique. Textbook.",
    "📖 That's going in the instructional",
    "🎬 Someone is definitely filming this",
  ],
  momentum: [
    "🔥 ON FIRE. Somebody call the referee.",
    "🚂 FREIGHT TRAIN. NO BRAKES.",
    "🌊 Flow state activated.",
  ],
  match_start: [
    "🔔 Slap bump. Let's roll.",
    "🔔 Touch gloves... wait, wrong sport.",
    "🔔 No ego. Unless you're winning.",
    "🔔 The mat is everything.",
  ],
  sweep_success: [
    "🔄 The world is upside down. Well, for them.",
    "🎪 What a reversal! The crowd goes mild.",
  ],
  defense_success: [
    "🧱 DENIED. That defense was nasty.",
    "🚫 Access revoked.",
    "⛔ Not today.",
  ]
};
const maybeFlavor=(key)=>Math.random()<0.12?pick(FLAVOR_TEXT[key]||[]):null;

const AI_DIFF = {
  easy:   { acc:0.40, defMod:-2, name:"White Belt",  emoji:"🟢", desc:"Slower reactions, more mistakes" },
  medium: { acc:0.62, defMod:0,  name:"Purple Belt", emoji:"🟡", desc:"Balanced challenge" },
  hard:   { acc:0.82, defMod:3,  name:"Black Belt",  emoji:"🔴", desc:"Near-perfect execution, ruthless" }
};

const CHALLENGES = [
  { id:"speed",name:"Speed Demon",desc:"Win in under 10 turns",check:s=>s.won&&s.turns<10 },
  { id:"sub",name:"Submission Hunter",desc:"Win by submission",check:s=>s.won&&s.finish==="submission" },
  { id:"iron",name:"Iron Guard",desc:"Win without being submitted",check:s=>s.won&&!s.wasSubbed },
  { id:"dom",name:"Dominator",desc:"Win with 50%+ stamina left",check:s=>s.won&&s.myStamina>50 },
  { id:"back",name:"Comeback King",desc:"Win after your back was taken",check:s=>s.won&&s.wasTrappedBack },
  { id:"flawless",name:"Flawless",desc:"Win without failing a minigame",check:s=>s.won&&s.mgLosses===0 },
];

const POS_MAP_DATA = {
  [POS.STANDING]:     {x:50,y:8, emoji:"🧍"},
  [POS.CLINCH]:       {x:50,y:24,emoji:"🤼"},
  [POS.SCRAMBLE]:     {x:10,y:50,emoji:"🌀"},
  [POS.GUARD]:        {x:50,y:44,emoji:"🛡️"},
  [POS.HALF_GUARD]:   {x:90,y:44,emoji:"⚔️"},
  [POS.SIDE_CONTROL]: {x:25,y:66,emoji:"📌"},
  [POS.MOUNT]:        {x:50,y:84,emoji:"⛰️"},
  [POS.BACK_CONTROL]: {x:75,y:66,emoji:"🎯"}
};

const POS_LINKS = [
  [POS.STANDING,POS.CLINCH],[POS.STANDING,POS.SCRAMBLE],
  [POS.CLINCH,POS.GUARD],[POS.CLINCH,POS.HALF_GUARD],
  [POS.GUARD,POS.HALF_GUARD],[POS.GUARD,POS.SIDE_CONTROL],[POS.GUARD,POS.MOUNT],
  [POS.HALF_GUARD,POS.SIDE_CONTROL],[POS.HALF_GUARD,POS.MOUNT],
  [POS.SIDE_CONTROL,POS.MOUNT],[POS.SIDE_CONTROL,POS.BACK_CONTROL],
  [POS.MOUNT,POS.BACK_CONTROL],
  [POS.SCRAMBLE,POS.GUARD],[POS.SCRAMBLE,POS.SIDE_CONTROL],
];

// ── POSITION LAYOUT — controls fighter positioning in arena ──
// x/y: percentage of arena. z: layering. sz: pixel size for Fighter component. rot: degrees.
// Ground positions use SAME x center — top sprite (upright) overlaps bottom sprite (flat/wide)
// The visual stacking works because sprites have different aspect ratios rendered via object-fit:contain
const POS_LAYOUT = {
  [POS.STANDING]:    { top:{x:63,y:72,z:2,sz:140,rot:0},    btm:{x:37,y:72,z:1,sz:140,rot:0} },
  [POS.CLINCH]:      { top:{x:55,y:72,z:2,sz:140,rot:0},    btm:{x:45,y:72,z:1,sz:140,rot:0} },
  [POS.SCRAMBLE]:    { top:{x:56,y:74,z:2,sz:130,rot:10},    btm:{x:44,y:74,z:1,sz:130,rot:-10} },
  [POS.OPEN_GUARD]:  { top:{x:50,y:50,z:2,sz:145,rot:10},    btm:{x:50,y:62,z:1,sz:138,rot:-4} },
  [POS.BUTTERFLY_GUARD]:{ top:{x:50,y:50,z:2,sz:145,rot:12}, btm:{x:50,y:62,z:1,sz:135,rot:-6} },
  [POS.GUARD]:       { top:{x:50,y:48,z:2,sz:150,rot:14},    btm:{x:50,y:60,z:1,sz:140,rot:-5} },
  [POS.HALF_GUARD]:  { top:{x:50,y:48,z:2,sz:148,rot:12},    btm:{x:50,y:60,z:1,sz:135,rot:-10} },
  [POS.TURTLE]:      { top:{x:52,y:44,z:2,sz:150,rot:16},    btm:{x:48,y:62,z:1,sz:125,rot:-20} },
  [POS.SIDE_CONTROL]:{ top:{x:50,y:44,z:2,sz:155,rot:22},    btm:{x:50,y:62,z:1,sz:130,rot:-14} },
  [POS.MOUNT]:       { top:{x:50,y:40,z:2,sz:160,rot:6},     btm:{x:50,y:62,z:1,sz:130,rot:0} },
  [POS.BACK_CONTROL]:{ top:{x:48,y:42,z:2,sz:160,rot:-6},    btm:{x:52,y:60,z:1,sz:130,rot:10} }
};

// ── ALT MARCUS — used when both players pick Marcus ──
// sepia(1) normalizes all colors → hue-rotate(185deg) shifts to blue/teal → saturate(2.5) pumps color
// This is the classic CPS2 palette-swap technique (red gi → blue gi)
const MARCUS_ALT = {
  id:"marcus_alt", name:'Marcus "The Bull" Reyes', short:"Marcus B", nick:"The Bull", style:"Pressure Wrestler", difficulty:"EASY",
  bio:"Relentless top-pressure grappler. Smothers from top. Great for beginners.",
  color:"#3b82f6", accent:"#60a5fa", locked:false, isAlt:true,
  stats:{takedowns:9,guard:4,passing:8,submissions:7,escapes:5,strength:10,speed:8,stamina:9},
  sig:{name:"The Freight Train",type:"sequence",desc:"Double-leg takedown with 2-stage minigame"},
  skin:"#D4956A",hair:"#1a1a1a",shorts:"#3b82f6",belt:"#8B4513"
};

// ── HELPERS ──
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const rand=(a,b)=>Math.random()*(b-a)+a;
const randInt=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const todaysChallenge=()=>{const d=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);return CHALLENGES[d%CHALLENGES.length];};
const isNeutralPos=p=>(p===POS.STANDING||p===POS.CLINCH||p===POS.SCRAMBLE);

// ── STORAGE ──
const _memStore = {};
async function load(k,fb){try{return _memStore[k]!==undefined?JSON.parse(_memStore[k]):fb}catch{return fb}}
async function save(k,v){try{_memStore[k]=JSON.stringify(v)}catch(e){console.error(e)}}


const SPRITE_DATA = {
  "marcus_idle": "data:image/webp;base64,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",
  "marcus_win": "data:image/webp;base64,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",
  "marcus_lose": "data:image/webp;base64,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",
  "marcus_mountTop": "data:image/webp;base64,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",
  "marcus_mountBtm": "data:image/webp;base64,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",
  "marcus_backTop": "data:image/webp;base64,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",
  "marcus_pressTop": "data:image/webp;base64,UklGRiwLAABXRUJQVlA4WAoAAAAQAAAAnwAAnwAAQUxQSKcBAAABDzD/ERFCrrXtaeS8Gm+OdytvGWYqmcEbKqlkKNMxk5e3TC6AbgE7GuUeGEc56XedapQzE3+FPM5CmyKi/xPAfyH7F01CIZl/yiUlta5qrySpfn55NYWH9ndXspqQ0s0PDldyCt/OWV0pL5nowVTo85J+69IBR8U1gddL867KjiDX9p4nUYXUS01bV6+tdepPvRotq+bJ0aiTTbzqhSlaSujsYq9MZryltNbpSZSrrp/nVE/p7E2usHU6q4JTQ2r+Se9WuI1tTEjXfP1FhV0gSSbXxwqL4HZT6RqKX4bekv4E8kKLZpP/jYfTEhsDPrivRbviKm0l3VCku6ISFwWNGHCPF5kSa4AiM2yB8cfd9CcgAkEKubpwMf2KAclwN4Cc/sdaVBLhIc8AdE8pUCgiB7cIsBpTBrSLmMXgzpVEbQFeCYBVdB0nYwNXdqReaxsngwxYxUG7VSsiJygM9CsqaRrFVtA2gExJQjPpF3iANqFPUYIgD3ynNwke1gR9JXnGtwgHvUG5y7CA4UwVKyYznRTOTsqGSVk4KbMmZcbOn5T+aDL+9wgAVlA4IF4JAADwLACdASqgAKAAPlEijkWjoaETbPTAOAUEsjdwYAAzW6hfwHZeXq6n+SP5M/MrXX6V+HOTUKJ2afovuG9/f929gH3Le4B+j3+R/r3WA/of+19QH64/th7qP+39RvoAf0T/aer76hf7c+wB+0vqw/8L9ovgV/bX9vfgF/X3/4+wB6AHCLfy/6K/Ij/AdGb7E9rOTOzyxtciN4j/LN07AB9Y+IjjA/3PheeZegP0Kv+jycfS/sB/y3+w+l37FfQ7/YomUjI3jPafagkZG8Z7T7UEjF3BF9W7TTCs+0e7YciSztBkdjmqmto5myeX1K557gNkVtJAVbR5bl9W/mxPZQVPDMk0N5zdhRe6UE8uCQEZVlbkSbBhurx+HkD/fZCEHOJCr/P6XW7rTKoWqgmmXmbxjQVXrIVaP4pxW1s15n/0jimHzcTx0t0ZcpEiZ6LUQf5AmRX11pZ18OLJaYqzNVf/BjVlEEWjeM9p9qCRkbxggAD+5CWAAAACeyFFac3IejQtHn74m4D4YPJXD2UT23LGJhfb5tXrnK4Wk6kjoilDoGGfPuBUpKiW2IVrT4rCZNnzkIoixMaDy100yuhvyJHpujmAqlnrz6HVulElXXrXHeZ0NgZWZ1n4mOXu00H0Wlo1xCUMfU1gvjT2aGxhuDmRXm9ZjJfD4e65wUL6R3nauaC5K4HEO/6N2cMxnwCl1kEtK0z06XakFHjY+yJERMbSUCJ4yAxUlcwsTW/y1+Xk851k7V6Whq1HKeHI91ACgXqf+VWXy7cw2ZnQK+Azp6GD9Lggf1ACwWBF9Z2FMXf65Oic27yhD5XeLWqx04Xn16gCkx9KLpWSvHjavtUWWKdVm35Dzv6XmwzwP8GsB2zJXave93v+sKTC9yqyb/9c/tmH4MHm35wFeSPMn98ZiUEn+u9/GvGJqhqKpA7H7/Xy4aQ5Oe+Mqiz/JW03xxRNyRZsz4Jib8q2nARoWgBnlL9D1dBugHsIjCWENtH8MM5QAqiWu3s/4NVafEUhLl011i1PPYo8G58QMPF6um/4u4R2xvlD2ASSqeGVylX1cUdIRvFM/clg17I4+mimnjfPB/2wx1LfJzmU5t50ET3rEfWQiax/ES5dxIToYrwyf1PQkX0pVHGf1QFmwAgA2VlVTy3BcUHJtmbmOGO4kDt76Mh8cBeD9rW/XzSYbchdI5+kw8QB2HhOnEBVIX40P9vBgs6ooi3We3GtAlu4wQFPQNhTEGVm7xL5kafUzQTZtH82rMmTPG60sYhbWa5D8luPHue6tpleiThMS6TLB4OwQyY27ZsZXnuevvuIDpeo4jQqf2Z5U6PDAiRMSKWOCD9NQaCe/JnJ7ZQTXbeNQfEsQMtGfaFtQdCuMK9eIsIborLun0ewsH98dhDpSpXk4X4iThIBRxFFwLraecNqb0MvdLUyLNcCTMYfYpuKtvlW62NRBIn0jwVA70pnDFYyWyn7mBwbxlHBMNeEjy6nIAcstXL7JJ30yT9KMUKUyx0dNoFb1kGF5LJrWyzFZ0lfEtMqI73Ge0i4akYN7eHg9RToySKApMxkKmB43GPq4yR8Kgi/GKW25zKH5P9+zLDP+B2QCoWLHMciOfOdgwnyOFoNO52xpYG7LA+ZyF7XJAv/eFJ20U46t4jwFs7P2JpSkhuLP+L0Jau/pQb/Idr+dOFctpP49CmFCaQV7GpmsEH/BaC+05b4NL6waJLIYIeAR3uts9e/ValvslMgc/BXvtc5Xo22h2vzk0EnsHv4gc8v48nTJdh1woNalDON9UX4sgU3gfESqXQ4XdGaLJOARA3dqLEf9ToCG21bWyJF2CVjdOU8JE94PDnsSPVMiUjNTuPWeXTXfeTHVwOAbJ6J6T9u36b/f17lvLxGKqgO9X0qz3eLrpRL8fhhuH8nsFTyop8HRrVfPrrCc8id6RcocLA3OJ9ykUcANYfReOWAjeXrYfLmYSlLHrqZG7u74Ytw4DzAXwesWXlQJWXZ1/1wTi6vXWpmhgi3Vop9cNeGZHtq0UGjaz0lbpecDyR5h/r7YR7GPGztxMVomnbZsGcEZut277RtH/Q7DqUFsrhxf8oLMNkZzf8gaYVRoMwGbvaFwEYeXOgW7fMO00kxkwFPHvq99tt9Xs9sxiXWycR5fmZFYfxMzD6ARs+8mh8HKfOVlt4k+rTCPHJYb96CN81ZsXH2Wbi0XgSy2H+hVf44NGHooV7awGqjayRT9zANfffETZKjuQXG5GYvus9/5+HhT+jLC2rk+uSXPP1L+dU5zfDeGiz2EXSnMfW+AIdsn/y1IuQzbhjLomooUGsiueZRCBYewnH+07g5MT5zLmFd+jWqY/A2GfdWRwTmpRR7CH20lmS/8zBBrQLW4hz25al1CVxgr1SSiUr1mvh8XqsNcCrNJ9hpG8VpE+pPG6MBQbsbMyryYLOsXknfB2wurl0gq7C7CwKcN5CJzawCq8+cGY+4+1oirELj+ah+oSh0bu6ERaMs1LLnNtnLvFfLaMfaOXKsdiASEkhbab9whWsIVu3N/r/D2BrRf4UL0KvGidxuamocoXhnCz0b5hgoY2fjj40AWZQanphzac6gV/7LeOq2c37vqspRitE4fxCtg0UgRSxCIz4oHwxvb73ZEc2208CxsgG+szAHbXqlNRqMqjFrN2kELKAEjyXSzuZ7DDQUXuSuUzdmi3+1fumcJpkc4FhVRIoNJoNkl8QF2blqkTNSNFMjIDBw2xu2YUxtd4YkrQzG/UoaLpicibOOyXyc3ABBIpsHsK/sqRDafLtIIstUaGPk40xOJ33j3AY2VHFF32gGQHgx6ZbPaZJbVvCIcbYIM3Wd37E6bcyqyjqDJ6FjQb+F6EPRMWZT5GVi4YSPrTpm8wWCB+sFKkBD2sHzU27AwbCwC5H9dCO/WwdDR4DEeZ7bv5BdMgr9kqYixqKBp1wA16Dw42RsNk3s54SIvI2EOQuylKpElZeN7XULaAzPAOZhn5I9t9K68NS01Yx+6ovJhVjfhHKqaEd8TxlZLKAQA1WR2IreF+rliEerf+nfUCAALQ/xKdEBtqwATu5t//sxv/7M7//75z5trHVAhSeRdhS9Q9e1tMPxAAp/mop9yViNgrUfRg8bqkWnmRW/+rnomP19i5v6LDbqZtuqoEEJj+rbScorytgHNPY+ExBZgU7bkGZvBFR9gAAAAAAAAAAA",
  "marcus_tired": "data:image/webp;base64,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",
  "marcus_guardTop": "data:image/webp;base64,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",
  "marcus_guardBtm": "data:image/webp;base64,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",
  "marcus_tapOut": "data:image/webp;base64,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",
  "marcus_effort": "data:image/webp;base64,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",
  "yuki_idle": "data:image/webp;base64,UklGRlILAABXRUJQVlA4WAoAAAAQAAAAnwAAnwAAQUxQSBgAAAABDzD/ERFCQdoGTP2bnodLRP8TG+haYA1WUDggFAsAAHAzAJ0BKqAAoAA+USaORaOiIRLsdWg4BQSm7dX/qdpBb4b8jOc/5A8S8O4YDq2/Q/dB2kPEs/U/rOeYD9iv2W93L0WegB0i37gewB5a/7k/BN+337gfAP+62aS/yvtT/vXgr4SPGPtFxveS/9p6B/x363fhP7D+LnsT/jfAH3nfxnqBfj38o/wn5a+Rn2hWcf2H/VeoF6cfN/9FxgfW32AP5b/Lv896Zf4/wBvqX+H/0HuAfx3+d/7z/Efkb9Jf8l/s/7t+U/sd/N/69/wf8f8AP8W/l3+n/uX+W/8v+P/////8fv7Aew/+qxa9arg9M+CbiJ9bSePhvzjLycdFs9lz/Ptwav7C2Mrg0p/u59RYP/oUZjBwT4UEV3WenH9fK7U4GcHE9MzdNBU0x3H75mkjrCAFf54Z2AM/ftTff9Lc7fem/xHCW2bcN8UA/K0TJ3/fzQh44EzUaLwJ5COj1o34JPpr3c4VEcctfcSEccmk9HnDeHQQ2adVN0dkcLC6uWrcsIc9z36id4U+AlgQHsWuJye84bHsY1AXkAH2VxcHpqMwAAD+/gbQvwzf//6RAIoQEkIvH33+L3WX/codDzufI/czNonSjj/nZBt4qOll+5kTXWtDXIwotOUXKd/Ejpxke3Zgsy5Mp7fwmeebEYLuVfxOR8H9xqvuuxmQHJ3h5JHLJupH7WFAlNIKzj8j1htZnFXf18hvVATpXPokJJUmFrpffr/3Glk+52sLAYknNKJI/aZ9YbW6ZeCQtuDcVu0IBeOL09mbThwhsXcLE4Z/9KMQ/nLyCFQslUWlr6Uv3ow9Sv8XDVQb0rngPmxnAANWn4bWV+xlhUPfL4PX6bWwfgtVvHvnDisVM0iqoDgWHZj0QON1UsmY1ODKvtNbUI/H5jVsUG9pj0BOYhFIywCA8mGLn0sHWJHygZsLDIrosywGcJP73+oKHZyv+P3J96NZyZZdG+PrNwd++MUs72Hc+f3HZmDsgkEaHOO85l9j5xhcjtsQdK+quBKFHld3mnAJPoNLBTr7UlccUu8iTGKjFFxEQvNv/pg3iRoNq0mnvaoNievrm3m6dfV5SXxEFvN0jlxdW6fuvDXDp+AfpUWv2Lup1nxGs0yV553fNZ3ejwTfj6J2EJ+MtSmpDZHUffj4WQV3Z/thDBOFPLYKEfzr54LmvUCJRURjEO+TCyXLxmkg6P51Cl6Ys3ktqUB7uj0YDSzNdlQ7Br7TrYf/aqV04m5zXCcM0IcqX2jpPL43p0smLbEls59GcA+6OQjLMCjshP0QdIOyCjZMmQllbg0yPhyOfOCfnLc4zbNBdrTFB70A7XP50kFj3+sGz4h8ZxmHiKmfm6jDSiPlAqtGGXuk6RMDv//WJeFe//w+nVm/rls/WFzoola/u5Eo9ktGb3fuRzZgVCRKi0cfXG2esvs16P32tXISw+S+Ih3AUhJmDt6i9Ue8vAaUA5roqmImG/arhIOVV9SWsNtfwSHC1ZXVNEkbon9NUE0/fW3zYLUbcNmwfxIEKP+97nNeGD/RD96JLrrfUsO79k9S9uGpiF/F1U4dmX/f9pGEXMdcJz4OdthPn++fo+7eo/igcXdWYgTIpYej9OiaYdv2gun5CH7OV6TArM4kS4X66+r5a1Pt2SIB+EzfrHA2/hoTQ7Nk7R2lPXYmuYPMSqbBRDw+fEXW+SqbvG8ORzIAuAx7NPHgc+jG7mkUdTB0aW+vV8oZt1r+kO+jFrazDO//yKGnjQB6U1lfoXVk2dHPa/GSque/9v9SwQZo6D+3F0PMUTIUrk9L/UowB77AH3potBh2dxaDmfOjmuY3vpbbqflz5tSpmTXMs9Rq+I0L4Fsj1fJD8IZZL8MzXReNrJAG0rGabhb6ZHHE/ZuzPmHWerKfZkYvGZnDKpVQgATSejEq3/MerO//NPk9g1TMeXDzPwEJkCRb0+ugTKb4F99ma5rFtJuN2H7ry7xE8AEcUfaulTo4IAEn4E78Ui0USR0DQnkHO591CrtTY25FWybhnK5MxQJPp+eRPXypVT/fwVEFpK8ZXw+unAF43PKPJSkuqRAMNa13o0dXzftZ7P3iJfiOpaAoFHbs/+Jjyi2QbQwUpR6VEEPpuOWY960098sem4F1astiYJ+azejKn6qAATWEIBLlfr3jWDD3L+YlKs/DQdUIIa6EkD2by9k0VSShuGCOu81gut2OL3dkLy3lD0/CRx/x531t4dGKEmPdldtadPmiP2Wp3T4XiAXkyfkXef3EOuTeM+w/Qjvd2C2zUsNiXseVoa/3anwEPakbmcwpxvkp/yjNJq7+QK11HZ3w9lzHAcXP8o4mF1XRM2H33W2JEYMz/YIih/htwa/4zgIwl7cIzVRHkvovKQzcuGcLDkMt/iopictOI3DVjX8O0MUtBl0Ni5G/0rGkh0+1J6F0PrG4m4mHTciSrGLuS0HIZ13GJCzuqgTIVfHfZKDL8uaqQYf/h1VfUeFggvlbaufYrw2jxoKLn2rDxOpuBwWtPcwH6miz3IYaFtd4gCeOJUgfNc8az4Z7zsbcU27jVDEwg+7B0QMJvdRP7jEeTVLNlj99JsUZisIGwuoUFiy8GHDgUcoZOvYPhG7u7WSJ0gvxM4ZK9BOPbYKR5ilqGNsZ6/1h7KpfVaH1crnsfCDhJj8047zteYOtPDrKEy7LbqMBExvaZSNX+A6kiPb9YsPU5/3TtYFmeE+YDyUp89QjBP0EPYV2kBedqQYvDGQNeiIvWDuVdNNtlNN8sHN9umhxcBi6q1M1L6kp/Vv4eMeD+j9jyNU7ClB9PXpoDqkSZDh2VsL7UFn3rPKBuJHYQNnFzKrQFOOhPOT/fhLZ7vHAdq2KktrQRjU96ZTTYy9KMrmhaxVf8MCQnUEuK94SY40HK+45zHxkQrRlx6mLqZ1AzLPIi3IGIiK43rDoMRo/UaWvk/T+rBXfCCEmgUyatCFkVapik4Q09xiTLQ17GUXiiUfBVFWf+L4NTRwwzhelIE8TSA63ZcnccPjITx9sD7AfsyZ8KP+e/8nJp/a3mgZM2fmEHJOVqEiq3k5F/BXUuOxVhaHB+yPV4hcDJobRS92WaAhjhTMJZtCss3Z6GDUVWzlKCj5MPxal+/+Xe/rORrD/CT/X/Fii2Vj/WHgRZZq+A4P1Pd6SQmlWQwi+mk3e8E1rkddmzzVlVbklDmq+L3eV53FcZczl7Gdo3BwQSllQck80w391VGeyeH7HDs9H3v8VgUxeAm/Bf2hg46bowp/rg5zJWPz2XOcBbuf52/P5gdgqGKYqzduWnApuoG+1I8HdVZjJY/hoePhcF/TSIzItpRRDYYXAfTWmHRkzAwJt9JAjo9/55h58MYOf6uJFQcAeYu6iFeJRFYnlDybVMPqORx24L/qWK0yfDsPhr0Ao0dXtNjsm8F7mFT1pOfuIYzk3tplQd3Ikmh9XcdMEJgQ3dyhdUxUvqEVEJoLwmFhIfOqh8MU0z+7+peGKI7z+U9tlKoTB/6v/QTcWzuRFlwT9EDeEXtURFi9BYstQR88lLSbQUdLUbQDQMKfO76zl1CEuTaVzI5AisxCFflxTGJknytkH6RTabYUKFlSlBTFY3N8fKGKLnI185wbn9QFx0tRsZ836cWu8eKNqolX1u+icTnHWdKFL4n9rubx9jGEbHUhhiFSuunI43OF5X62J5Df1Q+bH2OTw8HvFLOlv7vmhjJN5yu5Ons9RJeKalu+Ct3dv6stWZxKV04PaejNdCgoDHozq6VQAaopBaRNtv///pAAAAAAAAAA=",
  "yuki_effort": "data:image/webp;base64,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",
  "yuki_tired": "data:image/webp;base64,UklGRpALAABXRUJQVlA4WAoAAAAQAAAAagAAcwAAQUxQSB0AAAABDzD/EREa1ARAwjD6V4ZPEvhE9H8CMKZnfwsYAQBWUDggTAsAAFAuAJ0BKmsAdAA+YSqQRaQioZUs5chABgSxmdK/tFDjf4ygKg52FwDz3MCiu9Nc788nbs+Z7oi70NIMn2r8dfOvxm+c/cDmGRHevv9H5xd7/xY1Avxb+ff6Df/QC/lH9R/1P3Ac9f2L9gD+af1D/T/ml8X/57wtfNPYD/lv9b/7H+A9i3/k8uP0v/4vcG/mX9Y/5Xrv+wn9yvZo/ZtAQQhe/Jn6e4+JraJzz95bCP4ODkrW4hUfljTwi201YRjq8tUiwqQFJhMSeEwsiLESIDcctaC3xvi+g23CU10NqFcVBE8rCDA3YdfaL2JIXlSv3rQX5oud/BSi4nm1694VZmF0UWmUUVwDJ1hnkrvQSSQ/+/zqUytbGwn8B+OFdf7nixptSEfeIbnoET+X3zrDsnUqYAd9bTIYUUQborJvvfTZpOsrkvhg3ajpoRMznPABjzkARs3SX2TR2MaXOJ1C4evMDETLtZ0/VVM3jPNcFGqQixqrQ6fxKXS1SaAA/v01uwLwHcv+PPafyuWMv2zrFjyyj8fnCu1gkOto+sfMWI+R84bApHjg2gVqyzwXycudgPmubxWqVkn6L2vXKhijWvnXRnjkgAhHN8p8/Jv82LaoXhsSLDIaaCL5p9CO2qcvuuqtt13rzVXK3K74OcN1oBEJC4XVXbqDAWMttVPSyxqZ0ifwLZPSiiXt0g9ofho7hkqxeX0pLKyY8H5frp/RqOzul1MengKKGwbGfd+wu27/jxuyvWA/KqxmlDThxp/GNH+Wb+MPeE3Xqa0zRYqafT6i6+6mDq+hoJ8D7YSdho+OIcx+JjBAFoFfL9s0r5r0LkuocsymNOYSRQ1Qt9ZDa6kwBn4Vc/RZul9q08xPZ4Vbz/vSFQrTZ4E3RRQ9Hj6n+gOnCdpIJG5d/ojNc1Ks86tqe1EQ1h0ErxrPYGriV63jDE2Euk/3J9k8Ins1dkgnFXYPufVW0a3vnWUeCKLYC1VOJUKRfCTOFXlwPXTIqf9MYaqT59ehUcQ89ePnwjDvAsEARD3N0okEv7yBMWWLnNTl15fiujijIL5Msz3Xq8LL89Oyty3VCkyK2LDfdFRCTGLpus8WvNpexkEABMB59oIsof7fjh3XGAIxeoEp4r7Io9MU5FwbcgNRH3gw7fs1j/Z5wC8o7PqeFACxzfvDvbDJhg1fQRgEqrClEGThYAngkRGilTisSK+m8kFQEe27ZgRAcAJwWazHNXCeesS7nZVfIWgXAVVKEubBRhcn1T7rVxjjjCGdcX2/dWE3s6/hjWwaO2JSH6qE+bcozYI3UyPnm8Af/8xktJCxLDCoslCJqWh8ogx3pW5n+Gk2cJp36CAieMsTYCsvZIj+2Lrmf/n5aWljakFDq2yOVxN4M5vfXQmgs8Adx2OnTOPBCGOKfnBSljn+96dKUmJmBmPm0qU+sk4elFMYB24RTAhqGdz8WIZScEnfd8mo6dDwSAM7yTJ/dOWGQD9FM1arG0DmOEeyOxA4wG8EBTEwqtfmoMpl/NQIoYYzpyAeY+CWxIpraJOP+7jhwbsDWWgpZz8R3L4z2IPeUEs41UkB8MmBQaJnqwaVoX49Q871GQT7lcAgoM7yz2/EAq4vd/Greu0CF8CisE1Nv6DmxezKjXloVYWFk7qYaegycVQhF3OUDkGp7zn5FYq/Ff4fNY1FvbbkxwYc8WnRuUnbP+R4YIze/YnF4O2pBCWcQMPN2nhrf45jzDtsAzbSaCtYtcNTiUtpyRz0n5b8lhv8mf9YuDX8q/4Z98aNAN3lQPT5C6hpl6bG4w/WMwtID9MzMDuBzHfdeTIM+GTHYhcftyxzhd75ZlKx6TDWXkej7NxTq/wa2+09nMW6jj+fOSSj7PaU20UhGPADl4iwCh9n90TvlQKNmHV4kQldODwkjHTlPe56cJ4zHdaWW/st0YVkHPlsB7PT5dAqlOevflMZfq9ONTBfyZvj/Tvh1E6D3mtL6xeSpmWfxPBRyvoB7FdCMc8oV8ckH8XuW4VzzxICRLULVOV1oyZQyRb64L7Lt0CrsxcB3/Fo1VY47awusEYKI5bWcmiHWkxHw66BiWVrvzJ6BW0Oz+hNn1iIFHD9m4T9jgMaWUo839/8QvIT9KzR/AiaPNMGowjZXLY5BrLSF6bbqWWiRij4ds1/GAmtJjsXZbZPwMidTMBQsKOXY7R+HFVxv66QSL02qWFLA4/5VhMFpZT8dxaQD7uj65B8F+Pi+7iFXcdCJk5jWUovEIv2zau9DaF/42/hGxxwwTrWfsbM7vdtAAdYfGt9QtaoN9tgABIdM7WMjroqq/4d34a0Ps5N1IB/EI/KgKNEdKGQUrF8f/MTfidqpegCYoCDi//rWrbKbzppxNa93HWZ9//VGBEvrbaKChGco6bZQOTsgneKa/Vh1Yb9Ddp5AndeXCIrvtG14MSb2gBySYwWg3ig4kiaf23xdmWGvTdqVX/d/vgL48rrqlU/PhDKtadjIEIQfeuOLGOl8UotSY6tvcrJuiGxdMBGfQucn8ASMGFvInQ/0QO3kz8ALs3GTyJPtGpRpdSxiYawq6E+GzJrWLoTYRM8xcv+8iVZ5dA7YXZnH0ihe21tui3tdFnTyYmvEmPRxX2A3WeTQN9+fVWWh0SGoimqBPXopCiyY0kWnR1jlrX9fDJs2tsxwAlfeymomfLnJXpz7Cwl6X0mf7Is1kteKxCZTXoSatDJQBjU72cUmorRQS+4n3Gr3EX/y8LMsUt2FowIPZmf1sa+iRD6DKRjvZyl1ZBNZs3PZAHDUj69XLBwzZUqHoHnizCsnC+An+J5RMxu0SjnbCemMwPFGdRP5uOBDjpA9k69dY6MGuipXmPtd5+IGlsIUQAbH73vX0kE3Nt6M1fYP84CsX66aXr4/By9rL0aOzVPtf2zZXBOi9bOoCayn/waxM7g2ziq/PkvZzXYadP6hK4xs9DFf1Pmzq4o1H5iVOBBcau8ZPOzPUzUHtPHEDyd2B7cg5vEOi9187+iCL4EFDzJPsNt8XuyKFhqQ/ixd/1Sm7/DcK6mFMzevsq14LxubR9zLJF+t1U/32bcek4cB2nvoKn15NalZViV9oXKtKHhlCQpJhmEBfYI8yAPErxllOu2hFdpg6ABhv3Pg2kVqcGOZgefH+wADuQzgbQH7bAzhtuKRInAWduHJ8r8yyVXgeLVWAYCrJvwMn/rM1lk9Fis6SOmFkLE6IdkmCPSkK3EccXGftNjCZ9hcqb8BG2GGoHj5wR89bp+cESPZm2OgbzKs/yWxUrzcUSwamHe/bzEDzEYz9H270r8Pp+JpAmtqyjB1JgKlPmbX7MhfiEqU8qu5k+OJI6L3toDLb5pMRBxY9rp/qJ5jqKWNNq/bDF7IdAf1En6gIpoGwFwp0uhzC8xkL29AZho9/kHf5T3rz3T0l0ln5AmMq0T03ty9znQWX/Oj3bnLCnqVUJRhgt0D9gTGSuR63E1/+7hPjOa9HqZ2irPYbn38suEDNriAkvImf4gv/r/1JxF8mGEEfhRuXotWMdjpLsTTOGFNh7S0hSq4c3pmlJIe3ofNpXxfYu+v5IF99cIwTOmYNJ6fH0glGExhuLmEIkse6wNXhGdIMfSJME/8GYkswm3sxzRcoPvl1COh1JVQPY8ptOJ4JjmTAgCSG8tS8MLbXUwdAsFMmlzxbgVSd4vhGwZ79W0S9y35aI6q7pvQ+KEyMmPbx+BHN3t3ml+5hj2llZ1ngmnAi3UnOCYnOv2lWykudZZTb+MaCOCDUS8o/fx8BC0P1v4xWhYVcQra1dPob3Yzov8m6SAJezsWCqJU2/GRxmGct4NmQjWBcqQgQuTa1nUghnQySvvl71iEwB2qQoAAA==",
  "yuki_tapOut": "data:image/webp;base64,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",
  "yuki_mountBtm": "data:image/webp;base64,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",
  "yuki_triangle": "data:image/webp;base64,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",
  "marcus_idle2": "data:image/webp;base64,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",
  "marcus_hit": "data:image/webp;base64,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",
  "marcus_pinned": "data:image/webp;base64,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",
  "marcus_backTaken": "data:image/webp;base64,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",
  "marcus_clinch": "data:image/webp;base64,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",
  "marcus_halfGuardTop": "data:image/webp;base64,UklGRmoPAABXRUJQVlA4WAoAAAAQAAAAnwAAnwAAQUxQSBkCAAABDzD/ERFCkrRtatx8PXJZYS3NVhxa0ZIzOkIqN/A+zBzJYc4BaI7gC5Ac5mw5ksM8bVbZbX2LbvVMZZtNRP8nAP9rp349cgYo1aJmyS5RgyTJFlGyo37wNKxjDWviklWmVRg5VopTpP+qx7WJqCdVt9VGFsx3bZRpbo9nQ85oV8QKi4jG5IE4aRGbBt0FK2tJmHDPHIuUZFIhGcJuMIlYJbcWRTHZ62mzXUVpTFa8mFVOOxZDJP2YCaVblPWQYZjOvOSX+UVKYzr2kOywgDY1U6E/WXQSOQNybLBaPVbUCTUb5pzazMm2ojKy4JDWKYF1ptWQ25Az9OITh9BuKiNuguIuN27qE66pE5iPjL0CfnrLN5UBQHILgPjadaeoBEkPAK6NiSKB1PRgGsaTVhd2m44jEt0Fv9eWLPKHdDXlmDJEPXxJX3s33ykaYsIA8CDvigIMc5BEFEBeh1EKjDEghQzwvdcqzOmoEJnNqObmAVRoSh1Mat6Ij2zQM404koFiEPnI2GLozgNJX9LHIqRsN0RkSk/SQyMiekgFdqfkMN2UHhqAFy6ki91SEzFdACgDysOmjLwbIqIDIMoBJbAuIx0AuclBJ/BsyqSERgEAGUkXgNRAF0DGJEi12KBuAFCsOGhEcbYLQE4faLBIg3WaB3tP1QO5+FfoQNXBQ1YHH3FdkPu15AGQ1dQXAnFNcjOAci3GxXX5bxoAVlA4ICoNAACwNwCdASqgAKAAPlEijkUjoiEUrPSgOAUEtTdur9WBH5n2PWlea/k57NtV/pX9D/UHG2Tn/jPOu5M/6H3Ye9/9VfcB+d/9H7gH6U/8D+q/2jsGftH6gP57/k/2b94D0AegB/Xv8d60//F9gf9xPYG/Zb1Y/+R+2fwK/th+3HwDfsz//PYA9AD/t8QB/Ivw78Av7t+RPnP4VvcX7B+2HqOZG59WOD8geKvwu1AvXvlte19kdZj0AvZj7HxI967zY/yngN/d/997AH569Vf+d/+P+i84n0r7Af8w/sXWV/dH2Q/2Z//5Z6QFMdICmOkBTHSApesVUafheoof2lfWwJxrF3/pQq9zIDmwWVlwZ9O9zBj6YJWqsefwy9zs6+eS7+fXLVfJnGlPF4cMruBMQNjOAZDp/CVYj/4Ch6FNJNO2wBdLHP+ftAWagukX8qHFocKacmv5MGh9nuPyWlzpF6PMRldw8SiD7Hstc2b7yebD6xgs6oOpIo546DMrmdkkrze/aNgwMeDxtYVwgNb97fm/m85g1jH/AXxgbxg3LVdqMvEcvuba+gwbuR+mW4lP6YRPBkjqmnEvyn9rlD+1yh/a5Q/tcjgAAP7+BtAAAA0NcyPVmXLcsGlCpQPR4XT9nrwiHBR3nOzR+AXFb/OgdNdfvR9dDZo7/wK0+tox/vh7gras6cX8jG+nIPcOVy/PHucXWRb+aCKu8FsRb1fzVaGk7ecFV/GYqFXO81HwyLLbL0AfJnVK3Uxs6VzW7kOy0/T9XZjl89QJ7qCvdVi0k8y26F78JYNehWAPpQNhYgTbW8vpfTZd+VXJeVRiRRK50dirIbwaIq/dup5zCgnwbkI16TFor37O/HPXHYm8L+SqKCtE/fL9PX13dDNX2ugVIAdOgd2w/50owbn+xcU3tpZ4+EfTDWWet55zn4WDYGz74tmSlX4bxx6g0KNCmKHSwMaKIeCD5ngWdYSwOQjS9LVUweK5NGc9BlGxlhyUtmr8jz0lHPtfv+osEThLfFbIwAd/2TZxs51RJ0KEgUGMUsYkmfer3K86NA4QQIDU67mNTeAAhfRAArq7T9nmsiUWZ2lGRKOFJricVfiEICAc3STxhLm7bnxMKzGT2TDaUHEvcRBD8PuawARH9ZUpAOwNKQWXJsddDgElj7vq3y+X1UHRCqC7kjj8B/yftLYUyatpvEVIcaOSVO0d9sBoOL9MR4j9O9XsQ/2ix14gP4llK0wAL3zwvB4PeU399cA7VOu+RUZy3kQuYDftjKEsYRAhEFbMQqcjI5lRbDg3ZRuIve2L3WcIwvZ/y2B0RzRsW3f6e79faN+PBF7fO3On56vxVSURkZV919TwJIDKWRsmKM47WxahVXgixo73/TFdVRX6VJk9FsHmm3u+/d/V3UKz3QEUH6RN7reedMbVTbsk7020qtIBfFbaX5nreGwpvk2cC01p6BHp2gCgn9d+h4NdkgTBjMGGXihSOsDvCgysB95nDt5xaTMz7Mvl8/eEFmzvAkFd5cBpKsWR4J198QyoK0JuC3hMLGzEaF9UWVopvMAJXb5imUhKiLdFtnYys4/7ygf344QWH0ETbZhJex5kcsR+MHPJUKSoOWNBMwqWnqeffax+265+3Wfo8sFNSk7apIr+rgrqoNPXBOkvPsCN90cy8Z/CPMcAGiCzSbutNZ11f33/wZ38aJGTczwI/SsUAfQeak3fnbKiml55/zosIU0yfVmiAdsYJcLoS9gQneT+r01WIAyreKMaCWoRbN1ewLmr8WXa2rlUps5XStOPLMn+dZp1KeScX5EsXLGPgdTa7s1idIjC39QlbDbZ5tLR/8Ulwq+h2lvEkELrL75xqYb9JFbzPAGfEuLyavaYRRiFJkNwbk/yOvPmV//a4KXz8qRUyDHdxGp8JrEgVn9RMkGsNNRmSEdygyGUNERoqF7vT6djyLrBmbpPAd53RkYhIMjUw4t+eRx+GsvBVpBNozLyWGczulDeSKh6tR7HGJSeSviXf+xt6Nsm54fRdY9xXlVw9VPwn9LcNueexv4atvSm0mtBDJvCZrJcCEDGRsxMbBhFcLKpYKZL7fcnYUfQj1tvvy9I5wk7uPRr2NXGioeGwr0ZlwapgyqJOvD/nmXPkB+lXvUhm6t4ARv8gWwo5/KClh9Vq5vyGKqE7WFskzb9sx5GtpKy2vcvzqe2X1rb06JWOdnNz5qgRowGlwvN0ptTsRzjOxt/N55muhIHr9aXN6uLVms8gARxXRnHrJigcfMMb0iywWo/lJ9kVSIKDNFDdJvKGv8mpqNE+Az13OS4yV1m6CMb1IeibOtqhFIiAMaFMjqxUNul7/uDM+zGn0gK94YuhusXSLkXcg3HUEPxBKJxjfmUX1a/sGtHrvBgCvJbmtQrge5yPlcSu9VkN8JiM6d0yy8oBVlFAlSB5c4FcxinoD1nMM+Z3rZBrlc9fA1b+BSzbQH3i3dkuVWZmuqG/C2sx1+acP/jbInaDJk10YqzEUo97UHS6YDrrmSPiF1RMvnKaCeu5Xh6Xs7a34+5XW4/+OJqoxKukOCX5ZS806ep2al+GiJcPJBmQU4SFZfjbHM9AwMpfklWoIaDz1NH4N3xDeuhbQHdGeKErcmCyX1tTPOrEGjYYu9hvNDOYGWfYUhMPd4khVCRTNhM/jY40HWA9nYe7YxOPjDSiA91KKT///R//dqQVz8KUS7+w/l7UX6bBFWDlVmm/XEDL0Wpcs4+qCIRAyp9OeC9cuEm/NxE9VXB/5sMe2pFAcHABXSB7zyOSuRto83QumTltDwJNcGC1ufp2ieTpNAAgI8bnrIYiwuOJzK/1HMgXo+t2vZSd2+F1+am0aN7wxuTthcaE+Hg9ohvKqLW/YZWZFsQa4/MR39W2nis9aDzYnY9tm7/z6/t4MheOHa/+06IOZowY3zozOUa5cM456PxA5bo2T8H/98agXRLEepfA4Uz6pM8HkrXSTXQtoSfKi4dD/5cYU9923DD0Oit2FDJJHHEYkC2YnoT3g+zlCSX4C2CUF2uekRrhIjtEnFVz0VT9tCimu2gYIVkXhvgUViMPps/LT48MzZO5Fa6g0k0iGJyHXSPp7BN1hnPVrue9Q38SG+tfZWm4oEX7J1m+PESh8Y5/dEmY0VZauG+2pnyCFKT90Ejol/r14/POD5ISCWNWF6ibKRHdq/qHGRh8EQts40j+pczULfZtWppFBIb9h3sck4yvSAwr//0Ggl2GpkeJH6JlSqRavM4J3T5h9WuEKTsQdIdflsHeGJ9fIXFggcB//qkDrP2ivF8Fgj8sFdc5Z0GSR/dU0+lhaX9rIIbixs86uqR5CQdEH0uIAmn5Qh74FOzobSVcWcNfzdS0vWPFgTIkCn+xwXGWWcVSRkISbymUNpaAU82uQVyH5BJ34Q1yy0STEHWa87bxU0p+g3ilu72+cgV6V7thG723FXZxywRT/uSsa/UKiZJYohEaZ6E6XP6m9Ok8mSjPdlzPnY3I2xlRRC90a7IlTTGUUbCjCJLm+ZvdzJjHJIf/WfkTbwqU/qsbS8r4YHifvW2mFVi4faRNKWgTyWpZSCswHiIFSPtJL4PkfDf+K/mqS2MJ5Rg/aKDiYJYiHmR0vjxmfWcAL4XBm9LAUd/U27V6RnsP/ipxOZMjY9rsYTAEdNJyR7y+oBGIVCpodwfmnLXKBusyWaEzBMCidTXjk8W7xWBI6593Unm/ihhdTw8Du3remvIfjvb7vGIZyizKT7spW8wVX8hyZUsY1amtZrFLgDB89Ndjs1Y/3qNlX+mCk43eUSVxI+5ZwQdjSQT/mKpUrHkZu57/HF/p3M2XbjeRdvq0HwmqbZLz5BS6kiK3pu+xa68KxCYIVxFcdcShlr0hb/WBCpUKetGgkpCuvrBa/+DKNy8jW7877SkVgOvv+KItZAppCJXa4UQQcqwqPDVW9lvwz5XWzZheKcmUehRmlxj3nyD14ylbh6MoOIOkaGvCtn3DXdzeO291WjzKL4LOeb+Q2GplRSbOSEMjlhWhGVZPgUwP877wg8zYORGTP8v511l2TO9UQ4AfhRuJrssetzoevSp8yYEt1GO9Q8iUkvp23U0yoFGv2uisDmNyAmSfxsGvYn1H1GNjVnu433DoDI0XGKg758Qz3WBVEA0Tx5fFrJFjrSiAar5HIitl/7kqGcPCDTxhLL5RrQf729oyb+xmqgUoHDWWCtOjkzlgYx6OuvQj9UbMSZkBNoC3NC0gNWvaLm2R5ag+SMT7T8OdRLvKbELZv6u/Nf/6I9//t+Ax6s0aE1wbo7Jn48seSQL2KG8YnbMQY2Pwexw1f+wjZcAz5MkTgGyGfWmoJ+A55ktR/g4Yyxlgs4FA1pPf/W4AJjkFvX1I2ic5MYdHHQ+LcO6NSNsKP1BuobnR2lDZGzK40rfpNuQxkpSDdfvERThUzaW/+yOLLhbgv/HoR8luh5AhUBwT8c/zk7AuRw/H+x5QYxRMAAAAAAAAAAA",
  "marcus_openGuardTop": "data:image/webp;base64,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",
  "marcus_turtleTop": "data:image/webp;base64,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",
  "yuki_backTaken": "data:image/webp;base64,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",
  "yuki_backTop": "data:image/webp;base64,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",
  "yuki_clinch": "data:image/webp;base64,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",
  "yuki_guardBtm": "data:image/webp;base64,UklGRmQYAABXRUJQVlA4WAoAAAAQAAAAnwAAnwAAQUxQSDcKAAABDAVt20gOf9j3H4KImADfd5UzY953rSvanJzXqjVUwaqaNbAhakfaHJCjoLLIcsDBp36zbVMkWdu2w4O1bpSYQWQGD9iB2wQSb5XF24vbAGZmZmZmvrsr4zoPISIjo2Y65TsiJkBrtm3Ptm3R6VE5ZxpA0UD29EIF9IDDYVFIOsg5K1TOTPie+9y3Vdz384V3nu+1ExETwP9R+HiU0mOfJQazNPc7PzsQYzjiM+Oh2mU9q3xWNM85vuw+IyIKGN07x/XZYJMoKU3mnIPt7bPBGDX2Z50czP08eEtFRUo3V+45j3M6+dPPgobDWIk1grX6HDBdgYZEHUQ7838/B0pRDYLdLOfUHLdvvYoCGG3Qtt2aIzvd/di3nSplkTK0GDUGi5uc279MAtDQaLMwFc1z01O7baggEoUCKCCW7BZnLkAACmIVtMh4NvbXE1OGYagcDY+/e+ZJJbLvaGm/cb6Vf38pDm4HnHk738K/KyszI+De7377RO5BUzrYONmL3KNNY/ffU1Gu6YH9W060uPKS8l2caLiaC8KJ/pB7UI95InovEI+E83wPR7OoTZTExolW15zQNcYdQM409GkcsXPMopbaCx84kxoYDRKXCMbqLNhOREYtNptalgAFtBbpb8/jdgQaKq7cGG7n4SGutXsibY/JbucebedRE2c4n2ydhzOf9uU0Psb9+rvT2JZ5rXCaWaRcU+ByGn9hreFqOY1ahNcJUKfhfSFAO4u2yFwF/XYWWRSv0l70LfEvF4lXaLz0LfEfliHgErnDv7zCK1CsTe6ugm1BWxR2PaSc7SJZHyZ9MA22rh1yTa5wd1vseqSWYH0O/MtHMhYgB7JC1pcH+ObdYYHABrDNXY5ouKIc8u6AQDE0vnQmR2CdCuAcuSsaEBDIlpir4CoaQHE3/ZMCgaapbC2f2/mbC3CR3+/0wN0pAbDKMrF0tJkFuObdDHPky3eGBGylldKW1EBcgSuKsUe2u4IbqLJFt4pWkpt/w383qBXkmOzXgboz+Hyqsnu9FVetbQWQFXgoXLzc3ALeVVCJrpRrdZdm5wpypEmv78RRMxUfCf9Q212zpEwCUCtwTtkN3xdIHPavHwnucb1Z3eqhSpWJcUHTOMPk/wiY0qbZB1JwpomgK2PjlgMaTTmV2Gmcbfs4hkxJcY5qNkdGTUx2tJi01AzW/TjszllW2Pmao8Qk7oJa7nZY1cxg+6EPg5vBgcHXBQ6jUUur3KJl9jACQXp8GHykOjCVFNe0fMnQOAa7EqBpmlZ8FJMpXYdd7UuwOIwAgrYu7j8+jK+2AU0ra8hYRu/QdCBAQtIZBVLtZz4KSHWQbFmw4cm82yuNAAUUlIJbQl/l44C/pYO6eIhUQS+KVFEHfetaUjpi6QMB7CBH5OXT6uk5ouwKGyQO6YuzPhhq5FyXPV3yfF8gZA9oqDYjfeBcPhgiYFqbMY0s5Es2wE5oYJJUrHQBduz/fjDn3GvZmjN3L256sVJyekeLG5OkCmX3nsdHc85NKPf2YFgwunndhWG8qdLNkoPzwdgEjCNevaw8xyJjW40Yo4Bx4JwDH8rb4wXEvbhEYzUKowxgXLu7t6YVmbznWXf+7wei9rATIXn3CascJkqL1isy87Ia2q99EH/GAqWx8tyd5wgjL9NFrklswD8zF56wmwOP+8Ztb7/1yRUCpLVaT6Rp8jqORRVgd0vyP4BvO7NKcdds2QbbLdAUvX3xu9/xSa2tAVp6mChSKC7mJLJrU63soO1VqlSktHwBKQmlJrvstz+dLy4BqFJogpqmekoVMOx3dXN5wW0bNKW96EU0oqZp5xxD+FTuQp+WCgE05lpe0mfGEvUORCDkzrotZWmpFUsZGuLxvz6ZqkMTEYCKYpxdnThmncd4B9LcGZN6dFOqoIZ9Rmg+jUdGpbywo/iqYerksfPg8SXgi/Vi3KIrhu6UYZd4fAotDnA1Sw2Oa5u6uOecvf3zlzjnkY3R3FLdsZuXxYt98Ql8sdtOgkqXmDj1qFrkNl87+svbkmS7acq4hOhKl8WF+82t97T2ha5khUSGbuUwNy5p1BZjbtuLtRkUPRxMF9b4FB5Gm1ujLI+JNbCPN4rbMkxyUcvlZqXsSunpnCTMPP+fb+7RrXSYHmTyVZp0DtS00dW2Mhv3ytHZLFZMhtAnU5eqUq+3t1k7tzcbF1+qI3JG3DsxS9fkeWs89liLHk0hcK53bnmZ/P1aKIy2edkSHsaZ57w7z0WMUNGmZTmLygkRDnkZYlPravduVJ53t+yR62yumTNtRmtt64ZVWNyxce9xzG0zQ0IPGlcrE1cp6Jx/FUE5iIhIECSi8CTP6daJnq1r0Tlt2Ki42nRVMXR+h6Q4DpWcOQhlRk3vKBZtzjnH8xoVnTDxuuT92tZs7Pr7qTZWLrXKlxzzeiQjnppUsGrbrUbcG6cuIsbUL9bYpaibrO15I8SUsF6QLzlUiUwqQTLjnMNT0jSx/Zw3ve7JR3bO6TG3SlqZRY809ETeTcTNZWxtLKbIphRD1c6To0UxduyoLnzBucc5q6XUVmH17WrZC21UnsvzFLlZuCk1uxttAKTjOEeV5ym6V1ny+NfP3LxZlhbUMqrD6uk5GLS4I6HNqkZmPXbDpHbnFBdxO4TFUh4+0XS72aR31dGoPPclnse1MrYVTZ4bV1MzKJyKRZd0NZSWYf/juzyuSmai3IjxYo1ww7LYk2AQRZbn1eWhWTOgYszLS680mm0v5GoyYYs1SxJeXIghZNmLlSaGTC2jkXrUofZQHmm6eT37zZ3f2RbXTEU1e5t50RPxludZjJVxNY21YvXgNptbV5ozifKc3eJLxJbo00b/iXEfsLeVVWVtnqPuiUhKqw0jrpLZWMZddG8evGlNnWBUSPyfc87TxLJu6iej29RWlplYNVk9sm1pSnnRBClj0bKtHtW6U+tJmypNj5t5r0rht9600uaj2pu7FrVMhe1hA4HWLN2r2kjb24oglpW4vTA3z3czbpvNyLhzuZap3rbLtaeYBHgk+wKUxmhSyHwz2bHV5C6G+wQ2tcrLDebGughprKioIFlhGRfzF3qH0fyY8T93UDNquyuZLrstPQQVTSJjc9FDu9fWe+6yIW3rEY+N5rmSfxzYvRRGc8uue4AjrZtBIu8C0e45r4OY56CRejJkrXzZh7DWl6P6HKaFDGgDNJVWJb0o9P/d3EWMoEeLnl6GSoYL8YCe0h7G2hvg+bUxLQWOKoPu3G3XvJ7NZf87HtBqXndjLRmr2dw1Nu66Zpoo12w3HGybIARy07qtJkJPxGPi3f+4NzMYJeV5bKXUotodwWdxH36S8aXBsXnSl1C/fmz/gWe84zf21UNjFzGmEdUyzn3+n4vnkTthiFjn+r/prsIUmVDcbbvmfITuGtUQcTufqu3F3DYjVY8eb84H+r1fPGBPjZ87n/Ivrzc81rpZ9uanz4f8K//r/p//+oefPf+v/sHjf/3Lr/7M+f8YBABWUDggBg4AAJAyAJ0BKqAAoAA+USaPRaOiIROLpRQ4BQSyk4ESasgaUnEAEIAYvMM2+ww1t30M7cbzGeeN6M/9hvlHRTeq5/isFV7Hv8h4R+P725KUb6MMv+B5xd8/yF1AnYfhb9X6AXtV9o/1XGZ4gH8u85O8b+0/7j2APzF6rn9j/8P9B5u/0L/Qf+P/RfAF/Of6n/zP8P+TXzaexH9t/ZE/XEsMGbec285tWD1oN+8v1/iRGY7aPDopSkiUj8uVxK5s0XGsR34SlDstvtG63x/YZKRuikjz8qmRCIbW+ll3CSzlAvxei2uEJyDDZXF8bJS/08VWhvuI/gzrPYqgJyujWdLd+hlVe9L/mxd8Jv/AGjcn+3EZrtRHsbu5rr5mYOKWv4wlCxo1R/LABvryL/n74Lotc/QG+rxA8FR8eyQupg422NjNGaJvQSXHQxnF7c/NMxgoEAMhtMCXhrgjvQ6WZ4b3bAyMbkVxObtDkcr+qv0ya8OO7T7UTFf8iLeddyq7Ov7SabeNWODaG3X2hHipKifTqH+sB2pIml4sl4s/olqAAP7kJYAAAUjsQZYlKvGb7FVNuFxFOiECtJFNSkn68bVQu8wvthpRCfvO+DXUo9uEboXAaDLW8bi/GQAn+42f16nTthzEkcDJTw+s08EeAJdHWUbRET0MKBguqCcGx/FQ3vyJsqbkXNwOxMZagehgAALad/R+Oz//Ob7QWRF024nYFBaSkl805SbLGENH60ryD6eb9CVoATEFaRo2qS+9D1qGYM9rHdr52xZUa4NHz7gPfxxV9gdcJjvLRHCPmsTcrd6O4xBYVA4x6RGj5HLfXMSadBSis++ZuU7j8biBOMZ7ZhQxstADrOW2/wSzFVNYsWaBYpCZ310iSr5WjvYF8EJeujGLY+WTY/7bFGHEPAG3STc5AvX/47Txg7n5uRg9KTfPhDI7RUFEU/VslrWAcHU6MtqUh7kBnmtd+BZUfAYGjFOgeZkDzwwvdHTtQkt4OAq6/G2iFuKVP5i8lOLhqzJ3EhjQ7sjIAUlyHJnQdPG47taS/Z1qm1+zV8wM9Bv7KPdR69vCJKe6dzhl50wLq3/1gEE2WQTu/3uFMOUSiMviAqlWo5EVbSjU2M7j/gJ/Ts8+lHudH/dluS8TPjNoCEZyosam+6CCGmpXsWW/C+S6VtB15CzvLe1yUrGaeAF6qjL4mbgM/gMKXTgRYMcrsAAAuOWQ05Ml9u2vM9oDlNY1UQxQaYjAlD+7Wlh4rucb2BSRM3iK/XbMdusR6d9hASYh1ejl4fKHbxwTglry3ZrGj9d283L8WX22UIafrDu9gymLt9wCd5RMZXeV5P+nhTZSchzkEAF5tt6XrUoWRmxhvlJb93DwzbIQPSOZsHZpOEVUCElJ3E6995yi9g329u1xpYK+FaiQ5n+jaH4wfa12Qk6OEvqs8iEU1oEwx8haizu2JilXF42hUICTJCxBfacW71dtlQaXA6QOCnrD8gGdKxyZmXNVtGYwJH0A1uiY48rkYutPwjcTBJGkZhK6/gMW6dD+JiVD17uNGCO5xEauAqLkB2MxqlQJvF9EH0XM3GrzDawltnmJxyl7AR8S8by8zR53PPhjWMkdORE5t+SnTzsopYD9F4H4RLKxajwkzbYpIW3g/TwTXQly1ZEwGNOiJgPKvVtZf0M2PuPE0wFrim1Dst0YeOt/EgmvGhtuFIeDcLnCx4UiU48WPhACkQkgYZ+mWUIxFfFUqEI682dDwGDZFILd+HetvwvBLjZpZ26Sr3MKGcLsRbTyx2z82lNVwJ6zBvd3bpJPuDkKaRNVymM1KIEW0l3eWE/SMiYLDUPc9bS0r9WJRAv8tW8sll8sULVWfRZ2VdXb7cEs/PnPJ6SnUBxm1vVbboQ4bjVZhlPwodjjCP5df5oX8B6H3F3DIzWneavmmSHLtrWSklN1+7jnenSI2u98OodZdj2sctQ+OjrQbNSrmKwowfmze6YFaCUJ1vwp8vDiZa1nibNNf8f3y7qDuRfWnms9RM5NvhbSYAaZHyGhUzzH1JG0OJgdK99LmtJ1AEyUxHdpjo+D4eOFe3R7VeHQL7F89G5hMx3H1jWh0B4//jALNl9FL7T1Ihopw5kLo8LUN4YhHBGjy/HTZE/tIxhtcvLaQDcmiGX7+D+FDheU9dd9yPovTuzepte8e+12DyT50op+/lnQw/ZFHM1aHZ8FdqeNJKJ/vlmGRipRGhSdgMj7v7r53oeelgbePQKF8QP76L/ZAw/oY7oknhDRZPrf/zDjqOHzMT+OaUzqOarCKW0gs+ShvEH2Q2yErxLQ1mtVWHDco7vKCRTC2PtltPiUFtIUJKDPTMuw30+ZudFQ+of0hV3vXb9D4DbzeKqMc68BnRiwhgu/ib/6xj6+DG22VXfCE+2tNik+hhNCoZrpjwHW5QOtSiR8T0qBUZ/69hYh9otoVWHt/zDrN+v1eJAsl9JIpma0tY/1+YDsnx9aN6mH38KWvZLPwAvT+HDfi/FmJPTjF5QoZJT5Q9+bHiqP1d16H18clV9cJ6pb80+0AT3zNjAbM4xQxD4FeOWWY0BaKn7lGcoY1k1i1tgbRgJrB5ZkFcRE5S5UJvdoN290O0EgcoJvVIyQGz1mfaBxh5ORHr3ZijlW6hP9uKnmGLgGlVZooQ5UaxKnL2R05ZcqzyqkpO5b1bdppZEjtEhYWU63oz3xNNSJag8eUNiOMlJUFfxEhDrbEnFAX4htLWYDxa+eo/AOOIXEGopfQFLEH2N/E2IJf21uiFLueJPN0+iVJ1vPPAl0uVf3chv7SIOtqPDt3gvfP1bljp+L3ODchUAc9qrvNCOCEalSK74+9GShqp+vRjrodgYw0+GWOEDmKF03D6Zwr8+niJf+LdYdg39OgRktU/GcctDy9wI9JLu5OG8SwfrK3kaOSFNUWMgcZVTtf+8E0TfKi85ki0qQoqyWHZ82RKFT3Ri4tggnQzlXE0/X2t5No5n5KYuVS5Vt535Dpp6uLGzd7eTbghSc/H/1uwlhDoUXo3Srvjy9Dzzud7cyV+z+VGDSo23hRJHmUSD+FDNYeCXD+OmIFoFv7F9iWgDoJQLT48P+FOvWZZ/TKw0dtzmanlYp2z0TG5ARJv95l5nKqfLMvPNeyICQHNjmppdhAlEPuAtcIFcQUunpF+yPgiU/cAGVPhB/tA7R/qpoU+C2HDD8xsYpTIUkRtiXVEtDRweTxl9YY+Y5IIbqlHDmQPkBN3D/6/Lu5wZxw4Tr+RBlnnSdyASBFDeNRM5KsF9RNkMRhHqiLLJ/idSbRG4vEeBtYgly59F/FoYD6vrTlyQSvmZFShAaJ9itkXwRcfJSWc/vNND/KIGpRCeAI+EOIEoMRXHVqgV4zxKiCAGG+EMMfS3/V+w0THbh2c48U1TBs55kbzmWwVvnPF1eZ+xHxPn5GXva/IWM1u6mB3lTI2B3A9EsNNowKNX6Ghnl/WMt4DUT3MkIeaBx7lVrBpOSHACq4B464v7lef7D21GzJj0WtBY93LFOmfNXq7XHPCigOcdH3WJTtgR97xX/TG+0DB/v8ZdinSGt5SsanuY9aoyybdSJotwX96XYUmimJTV6VAxUEM/vDtaFCphP7eW/IQ//kWeqf2Idzedd2YXnW4JINQmxjbXDspJA1n+WVIaNAk2gJe5KT4hGT/tfs8J/53UE/0FR4VWvPMEfMhuQNgewdu712W3yUFzXYqqkUD9hO3PMUGkiaMwcCmpuX/n1I58/ezx1SUswOo2+RLs7RK1NzleQMymLSi2z3rQkG/sukZTWVeZVGGzkKEi0jBtYRDVyi5ehRgx2pBlUXGAnUbUSywpyszElEPCCxFeVBgqWCQirlM5Ejz3+ECz3uZUkIv3fVSMzp6Q1Y0HSrbzjV8ETZcT2pFYusDYJUpcdhGHEHcNBBfJOqUWDKCQ6DutUS/7juxesP+Gvq+/UmNPBZSeh5cB6LBSfEZobdVzNxpzluCrylwmyz747p9XpbIurmS5jwQKeDlneSF8KBJMiV6HN57ygq2Rif61HzPQiWg8zH+Ou0UtQn7XLAzgjcdFnRZ9+Nu/9H7JcM1uTDUXc5nX8hJ0STgIqsw6qBJtSC/gt3VouLGphefJVBhBZz21tUeDOrf/VQEB0dwtErK4Mv2otVuEYK/ZzQ8UvQh/lLGz2V7HbCHMdwOSiU5olPOlGNfT6nKYXOzCyeGgf2SLbnKDwcg0WDBWDDrhyOM+CUMLUIG6mJMQb9sqdCbiyoiH0Q9D891mZB1Am513Fyky2CQTGPoen7xX4U+FJmoVu5zTYdUwU/zctKnbHl1jCscdUEXgTdDkDGnb6EYyyclHKikMt0Am2ayw1bdQvECmzaQg/kA5v3jioIHfIIMsno+TSjCxQPGmc3tYXlJVRjonWIgtjXkUX+iVZZXaI40GR7eWKUBIWdSNPUY1Wke7WIuSrg5NbONrUwvqZqPUcgaSMt+0nL5rs17GLxDXjdiBwSYFgCvCSNjZ2xMv/INQ4qKHRbL29nH3hlL2ejh3xRyKvSbsEd5Dy8FwLL/BqY2LDf95MGZFDo2Hwvz/M5QtVnW9oBoRgAQxr+LgDtcZFxpcUBFtNV2ygTNHWaHZsu/qbq3tdVD9B8cZ+iIzkNa2QhzSn1pd5k4sZnHzv+Ult4Oy44mHb7HLpLZAf4fWNtx15ktFJvLfrQD7JqUo0uJIqvayZmgmuqFBO5eZx585ZAKjDibUTEoponC6ikBFOfJnG9m95877WPFbt9MiICyCwvCc2ddcG9rgAAAAAAAAA",
  "yuki_guardTop": "data:image/webp;base64,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",
  "yuki_halfGuardBtm": "data:image/webp;base64,UklGRoQNAABXRUJQVlA4WAoAAAAQAAAAnwAAnwAAQUxQSFICAAABDzD/ERGCrrZ/alznG42PtQflLhw5yQUwkxS+hHR59g7CvPGMw10ugLu06RgUZqzJEEY5KD/Wzq+QZjb9aSL6PwEc5R4s+UJTNjbcIq2BEBaxwEd9ljYFePP35bQJ0D/wRJ5mgYbTi6QGoD6zPznp2EEzeTYtG9Q/vnpSSmMG3O7OTbmT0VN3zkhxY/x2ZkIzktW8cX7CxmCag68S2nuBfy2YlNkMjg22xpYLrPx6Wk1+IOGyDmgv32CyL4+VvWG1WW1p+zJWBMMZrD7NZMOl2PoMmJyyf0cRXyifnkXt33xYWos8qvLHirqprtiqgh3L5f528Kf7e/2pvopJws9f66499KnMoCkGxsuF0z/ZlI0FGe9mfXVdq2Lgi+CCrP/jpt790EfK4PSD9Xs3BN0XVEYqh220K9f8rmqsd5exhILcFf/JjVS9O8ISL8/awuyMUfU6woTumA3DbqzTMsfSLjc+Ya3T0sBOPUHfFAkX0JSt8Hp3ZHaozTkHr1ZmRX9Ug2B9wRqNdmUf0X+ODt9BgdjQXKWXHEtZPYMjXusbkspeEhlcAidv7NlWUtFJr7FeTS+D8NxTRSu5fEM/VOxq83KYfamykx4sWm1XjWSAXnKdpLIu1w9tyOE3Xa8/NHT+xPpQO5DmN2hvIE4me0/VQPpSo5+W8EDkj2fGVEAW0RchgTDyn+Yaz8H0bsRdn7L/gg3jpR8+fWw+ZsGscKyX3tVrGjeQwdRLueJAtgpGsiHigAtKOFGybaRkvJEgUkQIFUAY2Fi0lRyLS+X/0Iij1wFWUDggDAsAALAuAJ0BKqAAoAA+USaPRaOiIRKahPQ4BQSyt26v0bntVByLG3qT22/mR89L0O/4b0gOo59ADpQ/8T0gH//2EDsD/vf5Fee/ji9le1/Lf6b7fiO/kg8Z9QL2L5avunYmWb9AL2z+q981qL97PRP/VP9v6y/7rwBqAH8g/pv+u/vH5R/Sv/b/+n/IecH6J/7v+Y+AP+S/0b/g/3v8oPmu9jP7M+xN+vX3/klnRagkZIkZ7T7UEjJEjPaZA1SvWH7KFgq8N2eVAm9HFXTjtD8NNfA8akhMdQkTOb56ETWUKaafBnTTADiE/Fr31kb0OYWjqh+53Sn708n4l5+BnfRlAZ3acGSAR4RIBA6Z3nEwDua2fOXLWuwjUPyLQAITfJDHCCGv4e/+ZZYQ/nct4AZ00RpygH4KT0gp5KmphbakhAefJ1JZ6BQmZ/kNtMBby1YtUX1SK2bBTkHGs30EybRYqc+FXXPZhD8kJBQ8IyYwIKUfH1fpEjPafagkZIkZ0gAA/v4G0AAAADAfURvX1Ln8PaBCBMEki2fnixCzMUY7fHHx8OFHFduTt3h09PBRkKhBgZOmZPKDVGcVcbd1DZQAslEN/HfwI7S3CmS018J5ybrxugs3Czq8I0wbuhVG+YKH18Yu1P/XxsAAmf5oANl2XRS+LtFqsojAX+2e5tl9+GRLnXmOmJpgBtwoAfsBX4qggH7qffCgBkJKE6JAAJdscm4S7EhhfTksPL272+a9b29VRLLVaRSBLTKU7uYkGDD+i2KD9PkizP9RZ1uPQtUwnHGGJNiTHWSTBEEsd7AiYRxnXXnJBIqaxJOE/4F1sgcjZE8Is26vHh3SWB75QUehawouDt0FCcWH/UsQIPwccfX1EvbYwzrOasciiEHu2n0Xj+C5UeUQeV0rcUCMhcYJbKBMj8ulokWS6aiwHaRf/eWGHsVtKWCYs/yB15K/+Hkr3DXtd7X+zSfyRELgKB3tm+ISPYn9TpeC8HOwcZXRZsezxX4Ppmg7UCQpve0mMwX3w+QfRmTDqI/RZgyE7WMT/8LqKv3+TuXTJHxjPgeHFG3ZAWiBvKjV2kpcrQiqx1KLA5vJhp0HnFWkeTPGTd8H16wapJOIfZafRk/MdaRw360riZu9XS8emcgdlnmaQvajGwEwLNQAM7U/oLvrmYyH7V3k0cXCPjRtbFlotmX98WV7Q3S2avhXh2USemEdLHs/wh/uXfz1yql8Mf826B+mIGn/xBQJAAHSwn4Iac1eH+ZBhDnl0Y/w1giv7ZdOo1oArfzqA3p4GTq6O4wVd3jVUWMKn6eHeMn+GsXF+jX492v+iANZf/B3uIkLdHYUZi9Ej9zQzRq1m8+KUHAuzswADGiNoTRVaHVX5kxQd3xAFuhGC3qUAZZMlAyYzRyjk+scS9nOBijs6PDGNI6pb1R/6knx4Xl+hpiLnTDgXfXE/j2zILL/wv4HLSSboMSUGJGAt0GBoJUt8PMByhkLlvcZhtC2MNpemetAmouBRTcxGdQPBROFGN37uIvcDRRNXo+jLQs9V05LK6QB7ul47X7XfdBwOO1KjVsAGNSEuu+hZ/OuWzl03w4h8sDEqp12vV51Uj8ZC/T8CmaZ1BKJIP4TneVLXJu6brGHqlLjI7Ip2fs3zITIpSW8n+CbBb20LKwYMDQJiJlpwPw+PFfSebVuyT5WdwV/munZfzW1x5PUkvR+2WXkeKKnCu85LC854JVY2vOl0W3jhyfOnAGgrW1uNyJ4jdiBbKgX18mZHGmEWULZUCli9DUN8HhTfGJ2vFbISuzimwYs6erDdnD37MJFhACSnPNgEeHPfNKZDpdNLqeYdwQggnWSodLibgQLtywQUEdk3oscTDS8ymTyIyYAJwYlv/NtBCuHqXk5oKiFxyZ/iIzDE4WHHz1cR/vJ+uxIF5Y+bQ8B7SEOGvOMGdnN/PVZD8+Terbmjw72f9SmzaWQavibpc/PALEmQMNju0wbfEku/0/Jw6H/5EvlF5CXdOHmKf/Bh/nE/xLAysVFaJTZim/SSegZzoT8mId/kvLwxopxanzZXdMHPr5Lxu4qfj/QsU2nv0IVbbp1pXhXkx8xQ7TjVeq6GZTOKTtQc+OB4bNVNJel5wNtzxN/tD8IKItkkoo1hT7XTXdKO2JPWAWmZwNYiuRrqC/XG3Mzn4gaTf1N70EJuhkb/ezjupEmuuCBNBtu8JVYJNBb9YWxEbj4PKegPYs1eBhDx5fb3pIiumxmv+G/ew+aJ5PqoPU3rgj/mvFDsHw+EQUMjkIB5eXw3KmtMEOdJyhOmHCImfheLM0cqq7HRL2hhGy5pihm+ggXKr8Xo+UIrdbVCL23DLK1MvsAsRYihWIB1LK3Jwp2d4rCrRO0wiX472k2aw3UTGPb4sIdqCUDUPHfIOtFPop/xqN+9nP+Kq/v+cLHg0RwU97F+PTJz0cf4whGFXkAx4LO4OZSq8Cf1qKQCgrIYgzpHTpJx1JBCuDNIJ8vU1DMLkxQObvhSGsfzvAH1CYeZikma/ZIQN976IUuwiIFKd8WUU2bQwYFeMsvdRNagNmHYVzi4rxu4n86P6q641r7Ir1E9rolaw9QWwnUVS/ETQYVNh1+gE/YaIYR1C7EO8U3vwelNUoMio8ZYxVAKQmWgaeF2tA10+qDzmAP2gWjRGOwilILYKne2qoOHhUDlflP63YhZuAjWBuu0BJUflY7vb1cc8QshZDD5TEOP7yVhiMs99JyaThSwFMQ/e+YmXp4n8F6E9GnvsHlfInae9bYb+ZPuKLtIAzRBuQVx+/F69jNcsV7o7MFSNEGWFpgL2S4dgh1JydzGxr/AAA41xxA77zG0alvmKiMgKybs9Lfge80FeS93bsGKbOaIw4wY6pcPeODsKDY1zBEgFJB26xvFjppWTzxJUUXsYGulxH24yNqKn78LbJIGAiagTsDxm62AgpXdwLU+Pas0D8DfPzw4NxofovjjsNCLjkq+Lr4gfoHtwhUeOXBxDeLAgRt55F7q7p0zMPpLgQv8acBo3xXAxm6TiTRNN6HTBGN2Vik7gMLnYbkxveEbBatoc2QgLsvyK23mSXN415fhL1jp/59ueZy+gg3FzdIKNQaB6IWeFS+Z8Yv6F5Qg8tav1VnTzHW277LogzptbYAM2vcVmyWSPEgYOvHyQPK7s7iSQadcpt/JNrfSnh6WFEFtVjav/wJ5tNpy90zMBXBGkgEd1PKMCIDc3sTfkzcz1X7+rWokTik8G2GVnJaUVDecuWNB3qoeSWUbXnCAfNyH+RX5CICeAO7AV/6WqnM2gcuaTTpWfe8YBGCpHX8M12k64R2sVeS341OCx8U5Qq/vVAGI3RfZzMqW7Emr9g5Bb12AV/r6cmA6oMwyvnmI43RKjmLwokcxy9pbDXDCYNNV9Q4eGgz+lzBlm+nF0+QZtYdE0AzmzGkmRiK7UhwPVsHUrpBaCki+j+lVbpG3t7mK5JOSSgHDeRziFAkScP4swmkJRvCQ90iPB8R9cKwYy31d8GbIruQoMM/Wh10Sasey88diOQRd/djs/zYDqtBhrZOnrmevUQLG8HxBNdRtzti/vXjSdxanI5IeGbZYL01uVasnI2kAqC92iEKuzMwbOYXzEWKhCnFer1kXjb4WzMEWxkUOnorQ49xzOPATJErITtuCcPtTOrKc865tO99EJG8phVLl3/HCxMoP0fkePZIlfef84abAorpqactq+se3DARoSCy4rEJ+zLgbSNEo5N1gDcSj5r+dGdAAAAAAAAAAAAA",
  "yuki_hit": "data:image/webp;base64,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",
  "yuki_lose": "data:image/webp;base64,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",
  "yuki_mountTop": "data:image/webp;base64,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",
  "yuki_openGuardBtm": "data:image/webp;base64,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",
  "yuki_pinned": "data:image/webp;base64,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",
  "yuki_pressTop": "data:image/webp;base64,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",
  "yuki_spiderGuard": "data:image/webp;base64,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",
  "yuki_turtleBtm": "data:image/webp;base64,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",
  "yuki_win": "data:image/webp;base64,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"
};


// Sprite lookup: maps (charId, pose) -> SPRITE_DATA key
function getSprite(charId, pose) {
  // marcus_alt reuses marcus sprites (recolored via CSS filter)
  const lookupId = charId === "marcus_alt" ? "marcus" : charId;
  const key = lookupId + "_" + pose;
  if (SPRITE_DATA[key]) return SPRITE_DATA[key];
  // Fallback mappings
  const FB = {
    marcus: {
      idle: "marcus_idle", idle2: "marcus_idle2",
      win: "marcus_win", lose: "marcus_lose",
      hit: "marcus_hit", tired: "marcus_tired", effort: "marcus_effort",
      tapOut: "marcus_tapOut",
      clinch: "marcus_clinch",
      guardTop: "marcus_guardTop", guardBtm: "marcus_guardBtm",
      openGuardTop: "marcus_openGuardTop", openGuardBtm: "marcus_guardBtm",
      halfGuardTop: "marcus_halfGuardTop", halfGuardBtm: "marcus_pinned",
      spiderGuard: "marcus_guardBtm",
      mountTop: "marcus_mountTop", mountBtm: "marcus_mountBtm",
      pressTop: "marcus_pressTop", pinned: "marcus_pinned",
      turtleTop: "marcus_turtleTop", turtleBtm: "marcus_pinned",
      backTop: "marcus_backTop", backTaken: "marcus_backTaken"
    },
    yuki: {
      idle: "yuki_idle", idle2: "yuki_idle",
      win: "yuki_win", lose: "yuki_lose",
      hit: "yuki_hit", tired: "yuki_tired",
      effort: "yuki_effort", tapOut: "yuki_tapOut",
      clinch: "yuki_clinch",
      guardTop: "yuki_guardTop", guardBtm: "yuki_guardBtm",
      openGuardTop: "yuki_guardTop", openGuardBtm: "yuki_openGuardBtm",
      halfGuardTop: "yuki_guardTop", halfGuardBtm: "yuki_halfGuardBtm",
      spiderGuard: "yuki_spiderGuard",
      mountTop: "yuki_mountTop", mountBtm: "yuki_mountBtm",
      pressTop: "yuki_pressTop", pinned: "yuki_pinned",
      turtleTop: "yuki_pressTop", turtleBtm: "yuki_turtleBtm",
      backTop: "yuki_backTop", backTaken: "yuki_backTaken"
    }
  };
  const map = FB[lookupId];
  if (map && map[pose]) return SPRITE_DATA[map[pose]];
  // Last resort: idle
  return SPRITE_DATA[lookupId + "_idle"] || null;
}


/* ═══════════════════════════════════════════════════════════════
   PHASE 2: PALETTE SWAP ENGINE — Canvas-based pixel recoloring
   ═══════════════════════════════════════════════════════════════ */

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r:128, g:128, b:128 };
}

// Stores for template art (populated in Phase 5) and head sprites (Phase 7)
const GRAPPLE_TEMPLATES = {}; // e.g. "grapple_guard_similar": "data:image/png;base64,..."
const HEAD_SPRITES = {};      // e.g. "marcus_front": "data:image/png;base64,..."
const SPRITE_OVERRIDES = {};  // e.g. "yuki_guard_btm": "data:image/png;base64,..." (Phase 8)

class TemplateRecolorCache {
  constructor() {
    this.cache = new Map();
    this.templateImages = new Map();
  }

  async loadTemplates(templateData) {
    for (const [name, dataUrl] of Object.entries(templateData)) {
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });
      this.templateImages.set(name, img);
    }
  }

  getRecolored(templateName, topChar, btmChar) {
    const cacheKey = `${templateName}_${topChar.id}_${btmChar.id}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const img = this.templateImages.get(templateName);
    if (!img) return null;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; // pixel art — no smoothing
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const topPal = topChar.palette || { skin:topChar.skin, shorts:topChar.shorts, belt:topChar.belt };
    const btmPal = btmChar.palette || { skin:btmChar.skin, shorts:btmChar.shorts, belt:btmChar.belt };

    const replacements = [
      { zone: TEMPLATE_ZONES.topSkin, target: hexToRgb(topPal.skin) },
      { zone: TEMPLATE_ZONES.topGear, target: hexToRgb(topPal.shorts) },
      { zone: TEMPLATE_ZONES.topBelt, target: hexToRgb(topPal.belt) },
      { zone: TEMPLATE_ZONES.btmSkin, target: hexToRgb(btmPal.skin) },
      { zone: TEMPLATE_ZONES.btmGear, target: hexToRgb(btmPal.shorts) },
      { zone: TEMPLATE_ZONES.btmBelt, target: hexToRgb(btmPal.belt) },
    ];

    const TOLERANCE = 30;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue; // skip transparent
      for (const { zone, target } of replacements) {
        if (
          Math.abs(data[i]     - zone.r) < TOLERANCE &&
          Math.abs(data[i + 1] - zone.g) < TOLERANCE &&
          Math.abs(data[i + 2] - zone.b) < TOLERANCE
        ) {
          const lumOrig = (data[i] + data[i+1] + data[i+2]) / 3;
          const lumZone = (zone.r + zone.g + zone.b) / 3;
          const lumRatio = lumOrig / (lumZone || 1);
          data[i]     = Math.min(255, Math.round(target.r * lumRatio));
          data[i + 1] = Math.min(255, Math.round(target.g * lumRatio));
          data[i + 2] = Math.min(255, Math.round(target.b * lumRatio));
          break;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const resultUrl = canvas.toDataURL("image/png");
    this.cache.set(cacheKey, resultUrl);
    return resultUrl;
  }
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 3: HEAD COMPOSITING
   ═══════════════════════════════════════════════════════════════ */

function drawHead(ctx, headImg, anchor, buildData) {
  if (!headImg || !anchor) return;
  const hs = buildData.headSize || 20;
  const cx = (anchor.x / 100) * ctx.canvas.width;
  const cy = (anchor.y / 100) * ctx.canvas.height;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((anchor.angle || 0) * Math.PI / 180);
  ctx.drawImage(headImg, -hs/2, -hs/2, hs, hs);
  ctx.restore();
}

function compositeHeads(canvas, position, topChar, btmChar) {
  const anchors = HEAD_ANCHORS[position];
  if (!anchors) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const topBuild = BUILDS[topChar.build || "medium"];
  const btmBuild = BUILDS[btmChar.build || "medium"];

  // Get head view type and anchor for top fighter
  const topAnchorData = anchors.top;
  const topView = topAnchorData.view;
  const topAnchor = topAnchorData[topChar.build || "medium"];
  const topHeadKey = `${topChar.id}_${topView}`;

  // Get head view type and anchor for bottom fighter
  const btmAnchorData = anchors.btm;
  const btmView = btmAnchorData.view;
  const btmAnchor = btmAnchorData[btmChar.build || "medium"];
  const btmHeadKey = `${btmChar.id}_${btmView}`;

  // Load head images if available
  if (HEAD_SPRITES[topHeadKey]) {
    const img = new Image();
    img.src = HEAD_SPRITES[topHeadKey];
    if (img.complete) drawHead(ctx, img, topAnchor, topBuild);
  }
  if (HEAD_SPRITES[btmHeadKey]) {
    const img = new Image();
    img.src = HEAD_SPRITES[btmHeadKey];
    if (img.complete) drawHead(ctx, img, btmAnchor, btmBuild);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 4: GRAPPLE COMPOSITOR — Singleton orchestrator
   ═══════════════════════════════════════════════════════════════ */

const GrappleCompositor = {
  recolorCache: new TemplateRecolorCache(),
  initialized: false,
  headImages: new Map(),

  async init() {
    if (this.initialized) return;
    // Load any template images that exist
    if (Object.keys(GRAPPLE_TEMPLATES).length > 0) {
      await this.recolorCache.loadTemplates(GRAPPLE_TEMPLATES);
    }
    // Pre-load head sprite images
    for (const [key, dataUrl] of Object.entries(HEAD_SPRITES)) {
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });
      this.headImages.set(key, img);
    }
    this.initialized = true;
  },

  // Returns a composite data URL or null if templates aren't loaded
  getComposite(position, topChar, btmChar) {
    const templateName = getGrappleTemplate(position, topChar.build || "medium", btmChar.build || "medium");
    if (!templateName) return null;

    // Check for sprite overrides first (Phase 8)
    const overrideKey = `${topChar.id}_${btmChar.id}_${positionToKey(position)}`;
    if (SPRITE_OVERRIDES[overrideKey]) return SPRITE_OVERRIDES[overrideKey];

    // Try to get recolored template
    const recolored = this.recolorCache.getRecolored(templateName, topChar, btmChar);
    if (!recolored) return null;

    // Composite heads onto the recolored template
    const canvas = document.createElement("canvas");
    const img = this.recolorCache.templateImages.get(templateName);
    if (!img) return recolored; // Return recolored without heads if no template image
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // Draw recolored body
    const bodyImg = new Image();
    bodyImg.src = recolored;
    if (bodyImg.complete) {
      ctx.drawImage(bodyImg, 0, 0);
      compositeHeads(canvas, position, topChar, btmChar);
      return canvas.toDataURL("image/png");
    }

    return recolored;
  },

  // Check if template compositing is available for a position
  hasTemplates(position) {
    const templateName = getGrappleTemplate(position, "medium", "medium");
    return templateName && this.recolorCache.templateImages.has(templateName);
  }
};

// Resolve sprite with template awareness (Phase 4)
// Returns { pose, method } where method is "sprite" | "template" | "svg"
function resolveSpriteMethod(char, {position, isOnTop, stamina, isMinigame, animState, opponentChar}) {
  // Non-position-dependent states always use sprite method
  if (animState === "win") return { pose:"win", method:"sprite" };
  if (animState === "hit") return { pose:"hit", method:"sprite" };
  if (stamina < 25 && animState !== "win") return { pose:"tired", method:"sprite" };
  if (isMinigame) return { pose:"effort", method:"sprite" };

  // Standing/Clinch/Scramble — always sprite
  if (position===POS.CLINCH) return { pose:"clinch", method:"sprite" };
  if (position===POS.STANDING||position===POS.SCRAMBLE) return { pose:"idle", method:"sprite" };

  // Ground positions — check if template compositing available
  if (TEMPLATE_POSITIONS.includes(position) && GrappleCompositor.hasTemplates(position)) {
    return { pose: isOnTop ? "templateTop" : "templateBtm", method:"template" };
  }

  // Fallback to individual sprites
  const pose = resolveSprite(char, {position, isOnTop, stamina, isMinigame, animState});
  return { pose, method: getSprite(char.id, pose) ? "sprite" : "svg" };
}

// GrappleView component — renders template composite for ground positions
function GrappleView({position, topChar, btmChar, size=240}) {
  const [compositeUrl, setCompositeUrl] = React.useState(null);

  React.useEffect(() => {
    if (!GrappleCompositor.hasTemplates(position)) return;
    const url = GrappleCompositor.getComposite(position, topChar, btmChar);
    if (url) setCompositeUrl(url);
  }, [position, topChar?.id, btmChar?.id]);

  if (!compositeUrl) return null;

  return (
    <img src={compositeUrl} alt={`${topChar.short} vs ${btmChar.short}`}
      style={{width:size, height:size, objectFit:"contain", imageRendering:"pixelated",
        filter:`drop-shadow(0 4px 12px rgba(0,0,0,0.5))`}}
      draggable={false} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   MULTI-POSE FIGHTER SPRITE + RESOLVER
   ═══════════════════════════════════════════════════════════════ */

function resolveSprite(char, {position, isOnTop, stamina, isMinigame, animState}) {
  if (animState === "win") return "win";
  if (animState === "hit") return "hit";
  if (stamina < 25 && animState !== "win") return "tired";
  if (isMinigame) return "effort";
  // Standing/Clinch/Scramble — use clinch sprite when in clinch
  if (position===POS.CLINCH) return "clinch";
  if (position===POS.STANDING||position===POS.SCRAMBLE) return "idle";
  if (isOnTop) {
    if (position===POS.MOUNT) return "mountTop";
    if (position===POS.BACK_CONTROL) return "backTop";
    if (position===POS.OPEN_GUARD||position===POS.BUTTERFLY_GUARD) return "openGuardTop";
    if (position===POS.HALF_GUARD) return "halfGuardTop";
    if (position===POS.GUARD) return "guardTop";
    if (position===POS.TURTLE) return "turtleTop";
    return "pressTop"; // Side control
  }
  // Bottom positions
  if (position===POS.GUARD||position===POS.BUTTERFLY_GUARD) return char.id==="yuki"?"spiderGuard":"guardBtm";
  if (position===POS.OPEN_GUARD) return "openGuardBtm";
  if (position===POS.HALF_GUARD) return "halfGuardBtm";
  if (position===POS.TURTLE) return "turtleBtm";
  if (position===POS.MOUNT) return "mountBtm";
  if (position===POS.BACK_CONTROL) return "backTaken";
  return "pinned";
}

function Fighter({char, facing="right", pose="idle", size=120, isAttacking=false}) {
  const f = facing==="left"?-1:1;
  const prevPoseRef = React.useRef(pose);
  const [displayPose, setDisplayPose] = React.useState(pose);
  const [transClass, setTransClass] = React.useState("");
  const [outgoing, setOutgoing] = React.useState(null);
  const keyRef = React.useRef(0);

  // Detect pose changes and animate transition
  React.useEffect(()=>{
    const prev = prevPoseRef.current;
    if(prev === pose) return;
    prevPoseRef.current = pose;
    
    // Classify transition type
    const standingPoses = ["idle","idle2","win","hit","lose","tired","effort","clinch"];
    const groundPoses = ["guardTop","guardBtm","openGuardTop","openGuardBtm","halfGuardTop","halfGuardBtm","mountTop","mountBtm","pressTop","pinned","turtleTop","turtleBtm","backTop","backTaken","spiderGuard","tapOut"];
    const wasStanding = standingPoses.includes(prev);
    const isStanding = standingPoses.includes(pose);
    const isHit = pose==="hit";
    const isWin = pose==="win";
    const isDefeat = pose==="tapOut"||pose==="lose";
    
    let transType = "snap"; // default
    if(isDefeat) transType = "impact";           // defeat → dramatic impact transition
    else if(isWin) transType = "victory";         // win → dramatic bounce
    else if(wasStanding && !isStanding) transType = "drop";   // takedown
    else if(!wasStanding && isStanding) transType = "rise";   // stand up
    else if(!wasStanding && !isStanding) transType = "scramble"; // ground→ground
    else if(isHit) transType = "impact";
    
    // Choreograph based on type
    const transClasses = {
      snap: {out:"trans-out-snap", in:"trans-in-snap", dur:300},
      drop: {out:"trans-out-drop", in:"trans-in-drop", dur:600},
      rise: {out:"trans-out-rise", in:"trans-in-rise", dur:500},
      scramble: {out:"trans-out-scramble", in:"trans-in-scramble", dur:450},
      impact: {out:"", in:"trans-in-impact", dur:150},
      victory: {out:"trans-out-snap", in:"trans-in-victory", dur:600}
    };
    
    const t = transClasses[transType];
    keyRef.current++;
    
    // Start outgoing animation
    if(t.out){
      setOutgoing({pose:prev, cls:t.out, key:keyRef.current});
      setTimeout(()=>setOutgoing(null), t.dur);
    }
    
    // Delay incoming by a fraction
    const inDelay = transType==="impact" ? 0 : t.dur * 0.3;
    setTimeout(()=>{
      setDisplayPose(pose);
      setTransClass(t.in);
      setTimeout(()=>setTransClass(""), t.dur);
    }, inDelay);
    
  },[pose]);

  const actualPose = displayPose;
  const spriteUrl = getSprite(char.id, actualPose);
  const outSpriteUrl = outgoing ? getSprite(char.id, outgoing.pose) : null;
  
  // Idle animation class
  const idleAnim = displayPose==="win"?"anim-celebrate":
    displayPose==="hit"?"anim-hit":
    (displayPose==="tapOut"||displayPose==="lose")?"anim-tired":
    (displayPose==="backTaken"||displayPose==="pinned")?"anim-struggle":
    displayPose==="effort"?"anim-effort":
    displayPose==="tired"?"anim-tired":
    isAttacking?(facing==="right"?"anim-lunge":"anim-lungeLeft"):
    "anim-breathe";

  if (spriteUrl) {
    // Alt characters: sepia normalizes warm tones → hue-rotate shifts palette → saturate pumps color
    const hueFilter = char.isAlt ? "sepia(0.8) hue-rotate(180deg) saturate(2.5) brightness(1.1)" : "";
    const baseFilter = `drop-shadow(0 4px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 6px ${char.color}30)`;
    return (
      <div style={{width:size,height:size,position:"relative",transform:`scaleX(${f})`,"--char-color":char.color,
        filter:`${baseFilter} ${hueFilter}`}}>
        {/* Outgoing sprite (fading out) */}
        {outgoing && outSpriteUrl && (
          <img key={"out"+outgoing.key} src={outSpriteUrl} alt="prev" className={outgoing.cls}
            style={{width:size,height:size,objectFit:"contain",position:"absolute",top:0,left:0,imageRendering:"pixelated"}}
            draggable={false}/>
        )}
        {/* Active sprite */}
        <img key={"in"+keyRef.current} src={spriteUrl} alt={actualPose} className={`${idleAnim} ${transClass}`}
          style={{width:size,height:size,objectFit:"contain",imageRendering:"pixelated",position:"relative"}}
          draggable={false}/>
      </div>
    );
  }

  // Fallback SVG for locked chars
  const {skin,hair,shorts,color,belt} = char;
  return (
    <div className={idleAnim} style={{width:size,height:size,position:"relative",transform:`scaleX(${f})`}}>
      <svg viewBox="0 0 64 80" width={size} height={size}>
        <ellipse cx="32" cy="77" rx="14" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="22" y="55" width="7" height="15" rx="2" fill={skin}/><rect x="35" y="55" width="7" height="15" rx="2" fill={skin}/>
        <rect x="20" y="45" width="24" height="12" rx="3" fill={shorts}/><rect x="19" y="44" width="26" height="3" rx="1" fill={belt}/>
        <rect x="22" y="29" width="20" height="17" rx="4" fill={skin}/>
        <ellipse cx="32" cy="17" rx="10" ry="11" fill={skin}/><ellipse cx="32" cy="10" rx="11" ry="7" fill={hair}/>
        <circle cx="28" cy="17" r="1.2" fill="#111"/><circle cx="38" cy="17" r="1.2" fill="#111"/>
        <circle cx="32" cy="38" r="2.5" fill={color} opacity="0.5"/>
      </svg>
    </div>
  );
}

// ── DUST PARTICLES ──
function DustBurst({active, x="50%", y="80%"}){
  if(!active) return null;
  return(
    <div key={Date.now()} style={{position:"absolute",left:x,top:y,zIndex:55,pointerEvents:"none"}}>
      {[...Array(6)].map((_,i)=>(
        <div key={i} className="dust-particle" style={{
          position:"absolute",
          width:4+Math.random()*6,height:4+Math.random()*6,
          borderRadius:"50%",
          background:`rgba(180,160,130,${0.5+Math.random()*0.3})`,
          left:(-15+Math.random()*30)+"px",
          top:(-5+Math.random()*10)+"px",
          "--dx": (-20+Math.random()*40)+"px",
          "--dy": (-15-Math.random()*25)+"px",
          animationDelay:(Math.random()*0.1)+"s",
          animationDuration:(0.4+Math.random()*0.4)+"s"
        }}/>
      ))}
    </div>
  );
}

// ── SCREEN EFFECTS ──
function ImpactFlash({color="#fff",active}){
  if(!active) return null;
  return <div className="impact-flash" style={{background:color}} key={Date.now()}/>;
}

function SlamText({text,color="#eab308",active}){
  if(!active||!text) return null;
  return(
    <div key={text+Date.now()} className="anim-slamText" style={{
      position:"absolute",left:"50%",top:"30%",transform:"translate(-50%,-50%)",
      zIndex:60,fontSize:"1.5rem",fontWeight:900,color,textTransform:"uppercase",
      textShadow:`0 0 20px ${color}60, 0 2px 4px rgba(0,0,0,0.8)`,
      letterSpacing:"0.1em",whiteSpace:"nowrap",pointerEvents:"none"
    }}>{text}</div>
  );
}


// ── TIMER BAR ──
function TimerBar({pct}){
  return(
    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
      <div className="h-full rounded-full transition-all duration-100" style={{width:`${pct}%`,background:pct>30?"linear-gradient(90deg,#06d6a0,#34d399)":"#e63946"}}/>
    </div>
  );
}

// ── STAT BAR ──
function StatBar({label,value,max=10,color="#06d6a0",small=false}){
  return(
    <div className="flex items-center gap-2">
      <span className={`${small?"text-[10px] w-[62px]":"text-xs w-20"} text-gray-500 text-right uppercase tracking-wider`}>{label}</span>
      <div className={`flex-1 bg-gray-800 rounded-full overflow-hidden ${small?"h-1.5":"h-2"}`}>
        <div className="h-full rounded-full" style={{width:`${(value/max)*100}%`,background:color,transition:"width 0.5s"}}/>
      </div>
      <span className={`${small?"text-[10px] w-3":"text-xs w-4"} text-gray-400 font-bold`}>{value}</span>
    </div>
  );
}

// ── POSITION MAP ──
function PositionMap({current,playerChar,aiChar}){
  return(
    <div className="relative w-full" style={{aspectRatio:"1/1",maxWidth:190}}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {POS_LINKS.map(([a,b],i)=>(
          <line key={i} x1={POS_MAP_DATA[a].x} y1={POS_MAP_DATA[a].y} x2={POS_MAP_DATA[b].x} y2={POS_MAP_DATA[b].y} stroke="#1f2937" strokeWidth="0.6"/>
        ))}
      </svg>
      {Object.entries(POS_MAP_DATA).map(([p,{x,y,emoji}])=>{
        const act=p===current;
        return(
          <div key={p} className={`absolute flex flex-col items-center transition-all duration-500 ${act?"z-10":"opacity-30"}`}
            style={{left:`${x}%`,top:`${y}%`,transform:`translate(-50%,-50%) scale(${act?1.2:0.85})`}}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${act?"bg-yellow-500/20 border-2 border-yellow-400 shadow-lg shadow-yellow-500/30":"bg-gray-800 border border-gray-700"}`}>{emoji}</div>
            {act&&playerChar&&aiChar&&(
              <div className="flex gap-0.5 mt-0.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 text-[6px] font-black flex items-center justify-center" style={{borderColor:playerChar.color,background:playerChar.color+"30",color:playerChar.color}}>{playerChar.short[0]}</div>
                <div className="w-3.5 h-3.5 rounded-full border-2 text-[6px] font-black flex items-center justify-center" style={{borderColor:aiChar.color,background:aiChar.color+"30",color:aiChar.color}}>{aiChar.short[0]}</div>
              </div>
            )}
            <div className={`text-[8px] font-bold whitespace-nowrap ${act?"text-yellow-300":"text-gray-600"}`}>{p}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── EXCHANGE RESULT BANNER ──
function Banner({text,subtext,color,icon,onDone,duration=2200}){
  useEffect(()=>{const t=setTimeout(onDone,duration);return()=>clearTimeout(t);},[]);
  return(
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none" style={{background:"rgba(0,0,0,0.55)"}}>
      <div className="anim-bannerIn text-center px-10 py-6 rounded-2xl border-2" style={{background:`${color}15`,borderColor:`${color}50`,boxShadow:`0 0 60px ${color}25`}}>
        <div className="text-5xl mb-2">{icon}</div>
        <div className="text-3xl font-black tracking-tight" style={{color}}>{text}</div>
        {subtext&&<div className="text-sm text-gray-300 mt-1 max-w-xs">{subtext}</div>}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MINIGAMES
   ═══════════════════════════════════════════════════════════════ */

function SequenceMinigame({onComplete,statBonus}){
  const arrows=["↑","↓","←","→"];
  const keyMap={ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",w:"↑",s:"↓",a:"←",d:"→"};
  const len=clamp(4+Math.floor(statBonus/3),4,7);
  const [seq]=useState(()=>Array.from({length:len},()=>pick(arrows)));
  const [idx,setIdx]=useState(0);
  const [mistakes,setMistakes]=useState(0);
  const [time,setTime]=useState(100);
  const [shakeI,setShakeI]=useState(-1);
  const done=useRef(false);
  const iv=useRef(null);

  useEffect(()=>{
    iv.current=setInterval(()=>{
      setTime(p=>{
        const n=p-(1.6-statBonus*0.04);
        if(n<=0&&!done.current){done.current=true;clearInterval(iv.current);onComplete({success:false,score:0,label:"TIME UP"});return 0;}
        return n;
      });
    },50);
    return()=>clearInterval(iv.current);
  },[]);

  const press=useCallback((arrow)=>{
    if(done.current)return;
    if(arrow===seq[idx]){
      const n=idx+1; setIdx(n);
      if(n>=seq.length){done.current=true;clearInterval(iv.current);
        const sc=clamp(Math.round((time/100)*100-mistakes*20),10,100);
        onComplete({success:true,score:sc,label:sc>=80?"PERFECT":sc>=50?"GOOD":"WEAK"});}
    }else{
      const m=mistakes+1;setMistakes(m);setShakeI(idx);setTimeout(()=>setShakeI(-1),300);
      if(m>2){done.current=true;clearInterval(iv.current);onComplete({success:false,score:0,label:"MISS"});}
    }
  },[idx,mistakes,time,seq]);

  useEffect(()=>{
    const h=e=>{const a=keyMap[e.key];if(a){e.preventDefault();press(a);}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[press]);

  return(
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-xs uppercase tracking-[0.2em] text-blue-400 font-bold">↑↓←→ Sequence</div>
      <TimerBar pct={time}/>
      <div className="flex gap-2 items-center justify-center flex-wrap">
        {seq.map((a,i)=>(
          <div key={i} className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black border-2 transition-all ${
            i<idx?"bg-green-900/60 border-green-500 text-green-400 scale-90 opacity-50"
            :i===idx?`border-yellow-400 bg-yellow-900/30 text-yellow-300 scale-110 ${shakeI===i?"anim-shake":""}`
            :"border-gray-700 bg-gray-800/60 text-gray-600"}`}>{a}</div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {arrows.map(a=><button key={a} onClick={()=>press(a)} className="w-14 h-14 rounded-xl bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-2xl font-black text-white border border-gray-600 transition-all active:scale-90">{a}</button>)}
      </div>
    </div>
  );
}

function PowerMeterMinigame({onComplete,statBonus}){
  const [power,setPower]=useState(0);
  const dir=useRef(1);const stopped=useRef(false);const iv=useRef(null);
  const [frozen,setFrozen]=useState(false);
  const sweetS=60+statBonus*0.8,sweetE=82+statBonus*0.4;

  useEffect(()=>{
    iv.current=setInterval(()=>{
      setPower(p=>{let n=p+dir.current*(2.8-statBonus*0.06);if(n>=100){dir.current=-1;n=100;}if(n<=0){dir.current=1;n=0;}return n;});
    },20);
    return()=>clearInterval(iv.current);
  },[]);

  const stop=useCallback(()=>{
    if(stopped.current)return;stopped.current=true;clearInterval(iv.current);setFrozen(true);
    let sc,lb;
    if(power>=sweetS&&power<=sweetE){sc=100;lb="PERFECT";}
    else if(power>=40&&power<=95){sc=60;lb="GOOD";}
    else{sc=20;lb="WEAK";}
    setTimeout(()=>onComplete({success:sc>=50,score:sc,label:lb}),500);
  },[power]);

  useEffect(()=>{const h=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();stop();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[stop]);

  return(
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-xs uppercase tracking-[0.2em] text-yellow-400 font-bold">⚡ Power Meter</div>
      <div className="relative w-full h-14 bg-gray-800 rounded-xl overflow-hidden border border-gray-600">
        <div className="absolute inset-y-0 bg-red-900/40" style={{left:0,width:"40%"}}/>
        <div className="absolute inset-y-0 bg-yellow-900/30" style={{left:"40%",width:`${sweetS-40}%`}}/>
        <div className="absolute inset-y-0 border-x-2 border-green-400" style={{left:`${sweetS}%`,width:`${sweetE-sweetS}%`,background:"rgba(34,197,94,0.2)"}}/>
        <div className="absolute top-1 text-xs font-black text-green-300" style={{left:`${sweetS}%`,width:`${sweetE-sweetS}%`,textAlign:"center"}}>SWEET</div>
        <div className="absolute inset-y-0 bg-yellow-900/30" style={{left:`${sweetE}%`,width:`${95-sweetE}%`}}/>
        <div className="absolute inset-y-0 bg-red-900/40" style={{left:"95%",right:0}}/>
        <div className="absolute top-0 bottom-0 w-1.5 rounded-full bg-white shadow-lg shadow-white/60" style={{left:`${power}%`,transition:"none"}}>
          <div className="absolute -top-1 -left-2 w-5 h-5 bg-white rounded-full shadow-xl border-2 border-gray-300"/>
        </div>
      </div>
      <button onClick={stop} disabled={frozen} className={`px-10 py-3 rounded-xl text-lg font-black uppercase tracking-wider transition-all ${frozen?"bg-gray-700 text-gray-500":"bg-yellow-500 text-black hover:bg-yellow-400 active:scale-90"}`}>{frozen?"Locked!":"⚡ STOP"}</button>
    </div>
  );
}

function TimingRingMinigame({onComplete,statBonus}){
  const [ring,setRing]=useState(140);const stopped=useRef(false);const [frozen,setFrozen]=useState(false);const iv=useRef(null);
  const target=44+statBonus*0.5;

  useEffect(()=>{
    iv.current=setInterval(()=>{
      setRing(p=>{const n=p-(2.0-statBonus*0.04);if(n<=0&&!stopped.current){stopped.current=true;clearInterval(iv.current);onComplete({success:false,score:0,label:"MISS"});return 0;}return n;});
    },20);
    return()=>clearInterval(iv.current);
  },[]);

  const stop=useCallback(()=>{
    if(stopped.current)return;stopped.current=true;clearInterval(iv.current);setFrozen(true);
    const d=Math.abs(ring-target);let sc,lb;
    if(d<=6){sc=100;lb="PERFECT";}else if(d<=16){sc=65;lb="GOOD";}else if(d<=30){sc=30;lb="WEAK";}else{sc=0;lb="MISS";}
    setTimeout(()=>onComplete({success:sc>=50,score:sc,label:lb}),500);
  },[ring]);

  useEffect(()=>{const h=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();stop();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[stop]);

  return(
    <div className="flex flex-col items-center gap-4">
      <div className="text-xs uppercase tracking-[0.2em] text-green-400 font-bold">🎯 Timing Ring</div>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute rounded-full border-4 border-green-500/50" style={{width:target,height:target}}/>
        <div className={`absolute rounded-full border-4 ${frozen?(Math.abs(ring-target)<=6?"border-green-400":"border-red-400"):"border-cyan-400"}`} style={{width:ring,height:ring,transition:"none"}}/>
        <div className="w-3 h-3 bg-white rounded-full"/>
      </div>
      <button onClick={stop} disabled={frozen} className={`px-10 py-3 rounded-xl text-lg font-black uppercase tracking-wider transition-all ${frozen?"bg-gray-700 text-gray-500":"bg-green-500 text-black hover:bg-green-400 active:scale-90"}`}>{frozen?"Locked!":"🎯 LOCK"}</button>
    </div>
  );
}

function RapidTapMinigame({onComplete,statBonus}){
  const dur=3000;const target=Math.max(8,16-statBonus);
  const [taps,setTaps]=useState(0);const [time,setTime]=useState(100);
  const tR=useRef(0);const done=useRef(false);const st=useRef(Date.now());const iv=useRef(null);

  useEffect(()=>{
    st.current=Date.now();
    iv.current=setInterval(()=>{
      const el=Date.now()-st.current;const rem=Math.max(0,100-(el/dur)*100);setTime(rem);
      if(rem<=0&&!done.current){done.current=true;clearInterval(iv.current);
        const c=tR.current;let sc,lb;
        if(c>=target){sc=100;lb="PERFECT";}else if(c>=target*0.7){sc=65;lb="GOOD";}else if(c>=target*0.4){sc=30;lb="WEAK";}else{sc=0;lb="MISS";}
        onComplete({success:sc>=50,score:sc,label:lb});}
    },30);
    return()=>clearInterval(iv.current);
  },[]);

  const tap=useCallback(()=>{if(done.current)return;tR.current+=1;setTaps(tR.current);},[]);

  useEffect(()=>{const h=e=>{if(!e.repeat){e.preventDefault();tap();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[tap]);

  const pct=Math.min(100,(taps/target)*100);
  return(
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-xs uppercase tracking-[0.2em] text-orange-400 font-bold">👊 Rapid Tap</div>
      <TimerBar pct={time}/>
      <div className="text-5xl font-black tabular-nums" style={{color:pct>=100?"#06d6a0":"#fca311"}}>{taps}<span className="text-xl text-gray-500">/{target}</span></div>
      <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
        <div className="h-full rounded-full transition-all duration-75" style={{width:`${pct}%`,background:pct>=100?"#06d6a0":"linear-gradient(90deg,#f77f00,#fca311)"}}/>
      </div>
      <button onClick={tap} disabled={done.current} className="px-12 py-4 rounded-xl text-xl font-black uppercase bg-orange-500 text-black hover:bg-orange-400 active:scale-[0.85] active:bg-orange-300 transition-all select-none">👊 TAP!</button>
    </div>
  );
}

// ── GRIP FIGHT ──
// ── 3-STAGE SUBMISSION MINIGAME ──
// Used for BOTH attacker (locking in) and defender (escaping)
// difficulty: 0-1 scale (higher = harder). Affects bar speed and target width.
const SUB_STAGES_ATK = [
  {name:"LOCK IN",icon:"🔒",color:"#eab308"},
  {name:"TIGHTEN",icon:"💪",color:"#f97316"},
  {name:"FINISH!",icon:"🏆",color:"#e63946"},
];
const SUB_STAGES_DEF = [
  {name:"POSTURE UP",icon:"🛡️",color:"#06d6a0"},
  {name:"CREATE SPACE",icon:"🤼",color:"#3b82f6"},
  {name:"ESCAPE!",icon:"💥",color:"#8b5cf6"},
];

function SubmissionMinigame({isAttacking, attackerName, defenderName, difficulty=0.5, onComplete}){
  const stages = isAttacking ? SUB_STAGES_ATK : SUB_STAGES_DEF;
  const [stageIdx, setStageIdx] = useState(0);
  const [barPos, setBarPos] = useState(0); // 0-100
  const [results, setResults] = useState([]); // [{hit, accuracy}]
  const [frozen, setFrozen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const done = useRef(false);
  const iv = useRef(null);
  const barRef = useRef(0);

  // Each stage: target zone center + width, bar speed
  const getStageParams = (idx) => {
    const baseSpeed = 0.6 + difficulty * 0.5; // 0.6-1.1 base
    const speeds = [baseSpeed, baseSpeed * 1.35, baseSpeed * 1.7];
    const widths = [22 - difficulty * 6, 18 - difficulty * 5, 14 - difficulty * 4]; // target zone width
    // Randomize target position within safe range
    const centers = [35 + Math.random()*30, 30 + Math.random()*40, 25 + Math.random()*50];
    return { speed: speeds[idx], width: Math.max(8, widths[idx]), center: centers[idx] };
  };

  const paramsRef = useRef([getStageParams(0), getStageParams(1), getStageParams(2)]);
  const params = paramsRef.current[stageIdx];

  // Animate bar
  useEffect(()=>{
    if(frozen || done.current || showResult) return;
    barRef.current = 0;
    setBarPos(0);
    iv.current = setInterval(()=>{
      barRef.current += params.speed;
      if(barRef.current >= 100){
        // Missed — auto-fail this stage
        clearInterval(iv.current);
        if(!done.current) handleTap(true);
      }
      setBarPos(barRef.current);
    }, 16);
    return ()=>clearInterval(iv.current);
  },[stageIdx, frozen, showResult]);

  const handleTap = useCallback((autoFail=false)=>{
    if(done.current || frozen) return;
    clearInterval(iv.current);
    setFrozen(true);

    const pos = barRef.current;
    const {center, width} = paramsRef.current[stageIdx];
    const dist = autoFail ? 999 : Math.abs(pos - center);
    const halfW = width / 2;
    
    let accuracy, hitLabel;
    if(dist <= halfW * 0.4){ accuracy = 100; hitLabel = "PERFECT"; }
    else if(dist <= halfW){ accuracy = 70; hitLabel = "GOOD"; }
    else if(dist <= halfW * 1.8){ accuracy = 35; hitLabel = "WEAK"; }
    else { accuracy = 0; hitLabel = "MISS"; }

    const newResults = [...results, {accuracy, hitLabel}];
    setResults(newResults);

    // If MISS on any stage, fail immediately
    if(accuracy === 0){
      done.current = true;
      setTimeout(()=>{
        setShowResult(true);
        setTimeout(()=>onComplete({success:false, score:0, label:"MISS"}), 800);
      }, 400);
      return;
    }

    // Move to next stage or finish
    if(stageIdx < 2){
      setTimeout(()=>{
        setStageIdx(s=>s+1);
        setFrozen(false);
      }, 500);
    } else {
      // All 3 stages complete — calculate final result
      done.current = true;
      const avgScore = Math.round(newResults.reduce((a,r)=>a+r.accuracy, 0) / 3);
      const finalLabel = avgScore >= 80 ? "PERFECT" : avgScore >= 50 ? "GOOD" : "WEAK";
      setTimeout(()=>{
        setShowResult(true);
        setTimeout(()=>onComplete({success: avgScore >= 40, score: avgScore, label: finalLabel}), 800);
      }, 400);
    }
  },[stageIdx, results, frozen]);

  useEffect(()=>{
    const h = e => {if((e.key===" "||e.key==="Enter")&&!done.current){e.preventDefault();handleTap();}};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[handleTap]);

  const stage = stages[stageIdx];
  const {center, width} = params;

  if(showResult){
    const avgScore = results.reduce((a,r)=>a+r.accuracy,0)/Math.max(1,results.length);
    const won = avgScore >= 40;
    return(
      <div className="flex flex-col items-center gap-3 py-2 anim-popIn">
        <div className="text-2xl font-black" style={{color:won?(isAttacking?"#e63946":"#06d6a0"):"#6b7280"}}>
          {isAttacking?(won?"LOCKED IN!":"ESCAPED!"):(won?"ESCAPED!":"TAPPED OUT!")}
        </div>
        <div className="flex gap-2">
          {results.map((r,i)=>(
            <div key={i} className="px-2 py-1 rounded text-xs font-bold" style={{
              background:r.accuracy>=70?"#06d6a020":r.accuracy>=35?"#eab30820":"#e6394620",
              color:r.accuracy>=70?"#06d6a0":r.accuracy>=35?"#eab308":"#e63946"
            }}>{stages[i].name}: {r.hitLabel}</div>
          ))}
        </div>
      </div>
    );
  }

  return(
    <div className="flex flex-col items-center gap-3">
      {/* Stage indicators */}
      <div className="flex items-center gap-1">
        {stages.map((s,i)=>(
          <React.Fragment key={i}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
              i<stageIdx?"border-green-500 bg-green-500/20":i===stageIdx?"border-current scale-110":"border-gray-700 opacity-40"
            }`} style={{borderColor:i===stageIdx?s.color:undefined,color:i===stageIdx?s.color:undefined}}>
              {i<stageIdx?"✓":s.icon}
            </div>
            {i<2&&<div className={`w-6 h-0.5 ${i<stageIdx?"bg-green-500":"bg-gray-700"}`}/>}
          </React.Fragment>
        ))}
      </div>

      {/* Stage label */}
      <div className="text-center">
        <div className="text-lg font-black tracking-wider" style={{color:stage.color}}>{stage.icon} {stage.name}</div>
        <div className="text-[10px] text-gray-400">
          {isAttacking?`Lock in the ${defenderName}!`:`Escape ${attackerName}'s hold!`}
        </div>
      </div>

      {/* Timing bar */}
      <div className="relative w-64 h-8 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        {/* Target zone */}
        <div className="absolute top-0 bottom-0 rounded-sm" style={{
          left:`${center-width/2}%`, width:`${width}%`,
          background:`linear-gradient(180deg, ${stage.color}40, ${stage.color}25)`,
          borderLeft:`2px solid ${stage.color}80`, borderRight:`2px solid ${stage.color}80`
        }}/>
        {/* Perfect zone (inner) */}
        <div className="absolute top-0 bottom-0" style={{
          left:`${center-width*0.2}%`, width:`${width*0.4}%`,
          background:`${stage.color}30`
        }}/>
        {/* Moving cursor */}
        <div className="absolute top-0 bottom-0 w-1 rounded-full transition-none" style={{
          left:`${Math.min(barPos,100)}%`,
          background:frozen?(Math.abs(barPos-center)<=width/2?"#06d6a0":"#e63946"):"white",
          boxShadow:frozen?`0 0 8px ${Math.abs(barPos-center)<=width/2?"#06d6a0":"#e63946"}`:"0 0 6px white"
        }}/>
      </div>

      {/* Previous stage results */}
      {results.length>0&&(
        <div className="flex gap-1.5">
          {results.map((r,i)=>(
            <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
              color:r.accuracy>=70?"#06d6a0":r.accuracy>=35?"#eab308":"#e63946",
              background:r.accuracy>=70?"#06d6a020":"#e6394620"
            }}>{stages[i].name.split(" ")[0]}: {r.hitLabel}</span>
          ))}
        </div>
      )}

      {/* Tap button */}
      <button onClick={()=>handleTap()} disabled={frozen}
        className={`px-12 py-3 rounded-xl text-lg font-black uppercase tracking-wider transition-all ${
          frozen?"bg-gray-700 text-gray-500":"hover:brightness-110 active:scale-90 text-black"
        }`}
        style={frozen?{}:{background:stage.color}}>
        {frozen?(results[results.length-1]?.hitLabel||"..."):"TAP!"}
      </button>
      <div className="text-[10px] text-gray-500">Press SPACE or tap the button</div>
    </div>
  );
}

function GripFightMinigame({playerChar,aiChar,onComplete}){
  const dur=4000;
  const [pTaps,setPTaps]=useState(0);const [time,setTime]=useState(100);
  const pR=useRef(0);const done=useRef(false);const st=useRef(Date.now());
  const iv=useRef(null);const aiTaps=useRef(0);const aiIv=useRef(null);
  const [phase,setPhase]=useState("fight"); // "fight" | "result"
  const [winner,setWinner]=useState(null);

  useEffect(()=>{
    st.current=Date.now();
    const aiSpeed=200+Math.random()*250;
    aiIv.current=setInterval(()=>{aiTaps.current+=1;},aiSpeed);
    iv.current=setInterval(()=>{
      const el=Date.now()-st.current;const rem=Math.max(0,100-(el/dur)*100);setTime(rem);
      if(rem<=0&&!done.current){
        done.current=true;clearInterval(iv.current);clearInterval(aiIv.current);
        const pw=pR.current>=aiTaps.current;
        setWinner(pw);
        setPhase("result");
        // Show result for 2 seconds then proceed
        setTimeout(()=>{
          onComplete({playerFirst:pw,playerTaps:pR.current,aiTaps:aiTaps.current});
        },2200);
      }
    },30);
    return()=>{clearInterval(iv.current);clearInterval(aiIv.current);};
  },[]);

  const tap=useCallback(()=>{if(done.current)return;pR.current+=1;setPTaps(pR.current);},[]);
  useEffect(()=>{const h=e=>{if(!e.repeat){e.preventDefault();tap();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[tap]);

  if(phase==="result"){
    return(
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="text-center anim-popIn">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Grip Fight Result</div>
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <Fighter char={playerChar} size={110} facing="right" pose={winner?"win":"lose"}/>
              <div className="text-sm font-bold mt-1" style={{color:playerChar.color}}>{playerChar.short}</div>
              <div className="text-2xl font-black text-white">{pTaps}</div>
              <div className="text-xs text-gray-500">taps</div>
            </div>
            <div className="text-3xl font-black text-gray-600">VS</div>
            <div className="text-center">
              <Fighter char={aiChar} size={110} facing="left" pose={!winner?"win":"lose"}/>
              <div className="text-sm font-bold mt-1" style={{color:aiChar.color}}>{aiChar.short}</div>
              <div className="text-2xl font-black text-white">{aiTaps.current}</div>
              <div className="text-xs text-gray-500">taps</div>
            </div>
          </div>
          <div className="text-2xl font-black mb-2" style={{color:winner?playerChar.color:aiChar.color}}>
            {winner?`${playerChar.short} WINS THE GRIP!`:`${aiChar.short} WINS THE GRIP!`}
          </div>
          <div className="text-sm text-gray-400">{winner?"You go first!":"Opponent goes first!"}</div>
          <div className="mt-4 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 inline-block">
            <div className="text-xs text-gray-500">Starting the match...</div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-yellow-500 font-bold mb-1">⚔️ GRIP FIGHT</div>
        <div className="text-gray-400 text-sm mb-4">Tap faster to go first!</div>
        <TimerBar pct={time}/>
        <div className="flex items-center justify-between my-6 gap-4">
          <div className="flex-1 text-center">
            <Fighter char={playerChar} size={100} facing="right" pose="effort"/>
            <div className="text-sm font-bold mt-1" style={{color:playerChar.color}}>{playerChar.short}</div>
            <div className="text-3xl font-black text-white">{pTaps}</div>
          </div>
          <div className="text-2xl font-black text-gray-600">VS</div>
          <div className="flex-1 text-center">
            <Fighter char={aiChar} size={100} facing="left" pose="effort"/>
            <div className="text-sm font-bold mt-1" style={{color:aiChar.color}}>{aiChar.short}</div>
            <div className="text-3xl font-black text-gray-500">?</div>
          </div>
        </div>
        <button onClick={tap} className="w-full py-5 rounded-xl text-2xl font-black uppercase bg-yellow-500 text-black hover:bg-yellow-400 active:scale-90 active:bg-yellow-300 transition-all select-none anim-gripPulse">
          👊 FIGHT FOR GRIP!
        </button>
        <div className="text-xs text-gray-500 mt-2">Mash any key or tap!</div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MAIN GAME COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LockdownGame(){
  // ── SCREEN ──
  const [screen,setScreen]=useState("title");
  const [hoveredChar, setHoveredChar] = useState(CHARS.find(c=>!c.locked)||CHARS[0]);
  const [playerChar,setPlayerChar]=useState(null);
  const [aiChar,setAiChar]=useState(null);
  const [diff,setDiff]=useState("medium");

  // ── FIGHT STATE ──
  const [pos,setPos]=useState(POS.STANDING);
  const [pOnTop,setPOnTop]=useState(true); // player is on top?
  const [pStam,setPStam]=useState(100);
  const [aStam,setAStam]=useState(100);
  const [pMom,setPMom]=useState(0);
  const [aMom,setAMom]=useState(0);
  const [pTurn,setPTurn]=useState(true);
  const [turnN,setTurnN]=useState(1);
  const [result,setResult]=useState(null);
  const [log,setLog]=useState([]);

  // ── PHASE STATE MACHINE ──
  // "grip_fight" → "player_pick" | "player_minigame" | "defense_minigame" | "sub_minigame" | "ai_think" | "banner" | "done"
  const [phase,setPhase]=useState("grip_fight");
  const [banner,setBanner]=useState(null);
  const [activeMG,setActiveMG]=useState(null);
  const [pendingMove,setPendingMove]=useState(null);
  const [pendingSub,setPendingSub]=useState(null); // {move, isPlayerAttacking, difficulty, attackerName, defenderName}

  // ── TRACKING ──
  const [stats,setStats]=useState({mgLosses:0,wasTrappedBack:false,wasSubbed:false});
  const [eggStats,setEggStats]=useState({failStreak:0,perfectStreak:0,posAdvances:0,stallTurns:0,standingTurns:0,sameMove:null,sameMoveTimes:0,lastCharId:null});
  const [toast,setToast]=useState(null); // easter egg toast
  const [seenEggs,setSeenEggs]=useState([]);
  const [pendingDefense,setPendingDefense]=useState(null); // {move,isPlayer,score,label,defCfg}
  const [splashDone,setSplashDone]=useState(false); // splash screen animation
  const [pAnim,setPAnim]=useState("idle");
  const [aAnim,setAAnim]=useState("idle");
  const [arenaShake,setArenaShake]=useState("");
  const [flashColor,setFlashColor]=useState(null);
  const [slamText,setSlamText]=useState(null);
  const [pAttacking,setPAttacking]=useState(false);
  const [aAttacking,setAAttacking]=useState(false);
  const [dustActive,setDustActive]=useState(false);

  // Screen effect helpers
  const triggerFlash=(color="#fff")=>{setFlashColor(color);setTimeout(()=>setFlashColor(null),220);};
  const triggerShake=(heavy=false)=>{setArenaShake(heavy?"arena-shake anim-heavyShake":"arena-shake");setTimeout(()=>setArenaShake(""),700);};
  const triggerSlam=(text,color="#eab308")=>{setSlamText({text,color});setTimeout(()=>setSlamText(null),1800);};
  const triggerDust=()=>{setDustActive(true);setTimeout(()=>setDustActive(false),800);};
  const triggerAttack=(isPlayer)=>{
    if(isPlayer){setPAttacking(true);setTimeout(()=>setPAttacking(false),600);}
    else{setAAttacking(true);setTimeout(()=>setAAttacking(false),600);}
  };

  // ── MOVE CHOREOGRAPHY — sequences effects like CPS2 ──
  const choreograph = React.useCallback((type, isPlayer, extra={})=>{
    const charColor = isPlayer ? playerChar?.color : aiChar?.color;
    const defColor = isPlayer ? "#e63946" : playerChar?.color;
    
    switch(type){
      case "strike": // Normal positional move
        triggerAttack(isPlayer);
        setTimeout(()=>triggerFlash(charColor||"#fff"), 150);
        setTimeout(()=>triggerShake(false), 250);
        break;
      case "heavy": // Heavy damage move
        triggerAttack(isPlayer);
        setTimeout(()=>triggerFlash("#fff"), 120);
        setTimeout(()=>triggerShake(true), 200);
        setTimeout(()=>triggerDust(), 250);
        break;
      case "takedown": // Standing to ground
        triggerAttack(isPlayer);
        setTimeout(()=>{triggerFlash("#fff");}, 150);
        setTimeout(()=>triggerShake(true), 250);
        setTimeout(()=>triggerDust(), 300);
        setTimeout(()=>triggerSlam("TAKEDOWN!","#06d6a0"), 200);
        break;
      case "sweep": // Position reversal on ground
        setTimeout(()=>triggerShake(false), 80);
        setTimeout(()=>triggerDust(), 150);
        break;
      case "submission":
        triggerFlash("#eab308");
        setTimeout(()=>triggerShake(true), 150);
        setTimeout(()=>triggerSlam(extra.text||"SUBMISSION!","#eab308"), 200);
        break;
      case "tko":
        triggerFlash(isPlayer?"#06d6a0":"#e63946");
        setTimeout(()=>triggerShake(true), 100);
        setTimeout(()=>triggerSlam("TKO!",isPlayer?"#06d6a0":"#e63946"), 150);
        break;
      case "escape":
        setTimeout(()=>triggerDust(), 80);
        break;
    }
  },[playerChar, aiChar]);

  // ── PERSISTENCE ──
  const [streak,setStreak]=useState(0);
  const [record,setRecord]=useState({wins:0,losses:0,subs:0,bestStreak:0});
  const [chalDone,setChalDone]=useState(false);
  const [loaded,setLoaded]=useState(false);

  // ── MASTER REF — always up-to-date ──
  const R=useRef({});
  R.current={pos,pOnTop,pStam,aStam,pMom,aMom,pTurn,turnN,result,diff,stats,eggStats,playerChar,aiChar,streak,record};

  const logRef=useRef(null);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);

  useEffect(()=>{(async()=>{
    setStreak(await load("ld-streak",0));
    setRecord(await load("ld-record",{wins:0,losses:0,subs:0,bestStreak:0}));
    const eggs=await load("ld-eggs",[]);setSeenEggs(eggs);
    setLoaded(true);
  })();},[]);

  // ── HELPERS ──
  const addLog=useCallback((msg,type="info")=>{setLog(p=>[...p.slice(-40),{msg,type,id:Date.now()+Math.random()}]);},[]);

  const showBanner=useCallback((text,subtext,color,icon,dur=2200)=>{
    setBanner({text,subtext,color,icon,dur});
    setPhase("banner");
  },[]);

  // ── EASTER EGG SYSTEM ──
  const checkEggs=useCallback((moment,extra={})=>{
    const r=R.current;
    const s={
      moment, ...extra,
      pos:r.pos, pStam:r.pStam, aStam:r.aStam, pMom:r.pMom, aMom:r.aMom,
      turnN:r.turnN, diff:r.diff, streak:r.streak,
      charId:r.playerChar?.id?.replace("_alt",""),
      isOnTop:r.pOnTop, totalFights:r.record.wins+r.record.losses,
      totalWins:r.record.wins,
      lossStreak:r.streak<0?Math.abs(r.streak):0,
      hardLosses:r.record.losses, // simplified
      ...(r.eggStats||{}), ...(r.stats||{})
    };
    const eligible=EASTER_EGGS.filter(e=>{
      if(e.oneTime && seenEggs.includes(e.id)) return false;
      try{ return e.check(s); }catch{return false;}
    }).filter(e=>Math.random()<e.chance);
    if(eligible.length>0){
      const egg=pick(eligible);
      setToast(egg);
      if(!seenEggs.includes(egg.id)){
        const nse=[...seenEggs,egg.id];
        setSeenEggs(nse);
        save("ld-eggs",nse);
      }
      setTimeout(()=>setToast(null),3000);
    }
  },[seenEggs]);

  // ── GET AVAILABLE MOVES ──
  const getMoves=useCallback((char,isOnTop,position)=>{
    let moves=MOVES[position]||[];
    // Filter by from + character specials
    const charId=char?.id?.replace("_alt","");
    moves=moves.filter(m=>{
      if(m.special && m.special!==charId) return false;
      if(isNeutralPos(position)) return m.from==="any"||m.from==="top"||m.from==="bottom";
      return m.from==="any"||(isOnTop?m.from==="top":m.from==="bottom");
    });
    // Inject universal specials for this char in non-neutral ground positions
    if(!isNeutralPos(position)){
      UNIVERSAL_SPECIALS.forEach(us=>{
        if(us.special!==charId) return;
        // Check from direction
        const fromOk = us.from==="any"||(isOnTop?us.from==="top":us.from==="bottom");
        if(!fromOk) return;
        // Don't add if already present
        if(!moves.find(m=>m.name===us.name)) moves.push(us);
      });
    }
    return moves;
  },[]);

  // ── START FIGHT ──
  const startFight=useCallback((difficulty)=>{
    const charSwitched=eggStats.lastCharId!==null && eggStats.lastCharId!==playerChar?.id;
    setDiff(difficulty);setPos(POS.STANDING);setPOnTop(true);
    setPStam(100);setAStam(100);setPMom(0);setAMom(0);setPTurn(true);setTurnN(1);
    setResult(null);setLog([]);setPhase("grip_fight");setBanner(null);setActiveMG(null);
    setPendingMove(null);setPendingSub(null);setPendingDefense(null);
    setStats({mgLosses:0,wasTrappedBack:false,wasSubbed:false});
    setEggStats(p=>({failStreak:0,perfectStreak:0,posAdvances:0,stallTurns:0,standingTurns:0,sameMove:null,sameMoveTimes:0,lastCharId:playerChar?.id}));
    setChalDone(false);setPAnim("idle");setAAnim("idle");
    setScreen("fight");
    // Easter eggs: start moment
    setTimeout(()=>checkEggs("start",{diff:difficulty,charSwitched,totalFights:R.current.record.wins+R.current.record.losses}),500);
  },[eggStats.lastCharId,playerChar,checkEggs]);

  // ── GRIP FIGHT DONE ──
  const onGripFightDone=useCallback(({playerFirst})=>{
    setPTurn(playerFirst);
    const fl=maybeFlavor("match_start");
    addLog(fl||"🔔 Match begins! Standing position.");
    if(playerFirst) setPhase("player_pick"); else setPhase("ai_think");
    checkEggs("grip_close");
  },[addLog,checkEggs]);

  // ── FINISH FIGHT (uses refs to avoid stale closures) ──
  const finishFight=useCallback(async(playerWon,finish,subName="")=>{
    setResult({won:playerWon,finish,subName});
    setPhase("done");

    // Read latest from ref
    const r=R.current;
    const nr={...r.record};
    let ns=r.streak;
    if(playerWon){
      nr.wins++;if(finish==="submission")nr.subs++;
      ns+=1;if(ns>nr.bestStreak)nr.bestStreak=ns;
    }else{
      nr.losses++;ns=0;
      if(finish==="submission")setStats(p=>({...p,wasSubbed:true}));
    }
    setStreak(ns);setRecord(nr);
    await save("ld-streak",ns);await save("ld-record",nr);

    const ch=todaysChallenge();
    const st=R.current.stats;
    if(ch.check({won:playerWon,finish,turns:r.turnN,myStamina:playerWon?r.pStam:0,wasTrappedBack:st.wasTrappedBack,mgLosses:st.mgLosses,wasSubbed:st.wasSubbed}))
      setChalDone(true);

    // Easter eggs on finish
    const eggMoment=playerWon?"win":"loss";
    setTimeout(()=>checkEggs(eggMoment,{finish,subName,streak:ns}),400);
    if(finish==="submission"&&playerWon){
      setTimeout(()=>checkEggs("sub_finish",{subName}),600);
    }

    setTimeout(()=>setScreen("result"),2200);
  },[checkEggs]);

  // ══════════════════════════════════════════════
  // SUBMISSION SYSTEM (redesigned)
  // PERFECT minigame → instant tap
  // GOOD minigame → defense check (defender stat vs threshold)
  // WEAK/MISS → attempt fails
  // ══════════════════════════════════════════════

  const resolveSubmission=useCallback((move,isPlayer,score,label)=>{
    const r=R.current;
    const attacker=isPlayer?r.playerChar:r.aiChar;
    const defender=isPlayer?r.aiChar:r.playerChar;

    if(score<50){
      // WEAK/MISS — attempt fails, sub never locked in
      addLog(`❌ ${attacker.short}'s ${move.subName} attempt was too weak (${label})`, "fail");
      if(isPlayer) setStats(p=>({...p,mgLosses:p.mgLosses+1}));
      showBanner(label,`${move.subName} attempt fails!`,"#e63946","❌");
      return;
    }

    // Score >= 50 — sub is LOCKED IN → 3-stage minigame
    const atkSub = attacker.stats.submissions||5;
    const defEsc = defender.stats.escapes||5;
    const dom = POS_DOM[r.pos]||0;
    const stamDiff = isPlayer ? (r.pStam - r.aStam) : (r.aStam - r.pStam);

    // Calculate difficulty (0-1): higher = harder for the player in the minigame
    // For PLAYER ATTACKING: low difficulty = easier to finish (good sub stat, dominant pos, high score)
    // For PLAYER DEFENDING: high difficulty = harder to escape (AI has good sub, dominant pos)
    let diff;
    if(isPlayer){
      // Player is attacking: difficulty = how hard AI is to submit
      diff = 0.5 + (defEsc - atkSub)*0.04 - dom*0.04 - (score-50)*0.003 - stamDiff*0.002;
    } else {
      // Player is defending: difficulty = how hard to escape
      diff = 0.5 + (atkSub - defEsc)*0.04 + dom*0.04 + (score-50)*0.003 + stamDiff*0.002;
      // AI difficulty modifier
      diff += (AI_DIFF[r.diff].defMod||0) * 0.03;
    }
    diff = Math.max(0.15, Math.min(0.9, diff));

    addLog(`🔒 ${attacker.short} locks in ${move.subName}! ${isPlayer?"Finish it!":"DEFEND!"}`, "sub");
    choreograph("submission",isPlayer,{text:isPlayer?"LOCKED IN!":"DEFEND!"});

    setPendingSub({
      move, isPlayerAttacking:isPlayer, difficulty:diff,
      attackerName:attacker.short, defenderName:defender.short
    });
    setTimeout(()=>setPhase("sub_minigame"), 800);
  },[showBanner,addLog,choreograph]);

  // ══════════════════════════════════════════════
  // RESOLVE MOVE (positional + submission routing + defense)
  // ══════════════════════════════════════════════

  const resolveMove=useCallback((move,isPlayer,success,score,label)=>{
    const r=R.current;
    const attacker=isPlayer?r.playerChar:r.aiChar;
    const defender=isPlayer?r.aiChar:r.playerChar;

    // Deduct stamina cost (half on failure)
    const costMult=success?1:0.5;
    if(isPlayer) setPStam(p=>Math.max(0,p-move.cost*costMult));
    else setAStam(p=>Math.max(0,p-move.cost*costMult));

    // Track same-move spam for easter eggs
    if(isPlayer){
      setEggStats(p=>{
        const sm=p.sameMove===move.name?p.sameMoveTimes+1:1;
        return {...p,sameMove:move.name,sameMoveTimes:sm};
      });
    }

    if(!success){
      addLog(`❌ ${attacker.short}'s ${move.name} — ${label}!`,"fail");
      if(isPlayer){
        setPMom(0);setStats(p=>({...p,mgLosses:p.mgLosses+1}));
        setEggStats(p=>({...p,failStreak:p.failStreak+1,perfectStreak:0}));
        checkEggs("move_fail",{moveCost:move.cost,moveName:move.name});
      }
      else setAMom(0);
      showBanner(label,`${attacker.short}'s ${move.name} fails!`,"#e63946","❌");
      return;
    }

    // Track perfect streak
    if(isPlayer && score>=80) setEggStats(p=>({...p,perfectStreak:p.perfectStreak+1,failStreak:0}));
    else if(isPlayer) setEggStats(p=>({...p,perfectStreak:0,failStreak:0}));

    // SUBMISSION → route to sub system
    if(move.isSub){
      resolveSubmission(move,isPlayer,score,label);
      return;
    }

    // ── DEFENSE CHECK ──
    // If the move is defendable and changes position, check if defender can defend
    if(move.defendable && move.target && move.target!==r.pos){
      const defCfg=DEFENSE_CONFIG[move.defendable];
      if(defCfg){
        const defChance=calcDefenseChance(defCfg,attacker,defender,{
          isPlayerAttacking:isPlayer,pOnTop:r.pOnTop,pos:r.pos,
          pStam:r.pStam,aStam:r.aStam,pMom:r.pMom,aMom:r.aMom,score
        });
        if(Math.random()<defChance){
          // Defense triggered! Launch defense minigame
          setPendingDefense({move,isPlayer,score,label,defCfg,attacker,defender});
          const defStat=defender.stats[defCfg.defStat]||5;
          setActiveMG({type:defCfg.mgType,statVal:defStat,isDefense:true});
          addLog(`🛡️ ${defender.short} attempts to defend ${move.name}!`,"defense");
          choreograph("escape",!isPlayer);
          setPhase("defense_minigame");
          return;
        }
      }
    }

    // ── APPLY POSITIONAL MOVE (no defense) ──
    applyPositionalMove(move,isPlayer,score,label);
  },[showBanner,addLog,resolveSubmission,choreograph,checkEggs]);

  // ── APPLY POSITIONAL MOVE (extracted for reuse after defense) ──
  const applyPositionalMove=useCallback((move,isPlayer,score,label)=>{
    const r=R.current;
    const attacker=isPlayer?r.playerChar:r.aiChar;

    const dmg=Math.round(move.dmg*(score/100));
    if(isPlayer){setAStam(p=>Math.max(0,p-dmg));setAAnim("hit");setTimeout(()=>setAAnim("idle"),1200);}
    else{setPStam(p=>Math.max(0,p-dmg));setPAnim("hit");setTimeout(()=>setPAnim("idle"),1200);}

    // Special move effects
    if(move.specialEffect){
      if(move.specialEffect.resetMomentum){
        if(isPlayer) setAMom(0); else setPMom(0);
        addLog(`💥 ${attacker.short}'s ${move.name} kills all momentum!`,"special");
      }
      if(move.specialEffect.drainPassing){
        addLog(`🕸️ ${attacker.short} immobilizes from guard! Passing reduced!`,"special");
      }
    }

    if(move.target && move.target!==r.pos){
      const wasTakedown = isNeutralPos(r.pos) && !isNeutralPos(move.target);
      const wasGroundChange = !isNeutralPos(r.pos) && !isNeutralPos(move.target) && move.target!==r.pos;
      
      // Flavor text
      let logMsg=`✅ ${attacker.short} executes ${move.name} (${label})! → ${move.target}`;
      if(wasTakedown){ const fl=maybeFlavor("takedown_success"); if(fl)logMsg+=` ${fl}`; }
      else if(wasGroundChange && move.defendable==="sweep"){ const fl=maybeFlavor("sweep_success"); if(fl)logMsg+=` ${fl}`; }
      addLog(logMsg,"success");
      
      if(wasTakedown) choreograph("takedown", isPlayer);
      else if(wasGroundChange) choreograph("sweep", isPlayer);
      else choreograph("strike", isPlayer);
      
      setPos(move.target);
      if(move.attackerTop===null){
        setPOnTop(true);
      }else if(move.attackerTop===true){
        setPOnTop(isPlayer);
      }else{
        setPOnTop(!isPlayer);
      }

      // Track position advances for easter eggs
      if(isPlayer) setEggStats(p=>({...p,posAdvances:p.posAdvances+1,stallTurns:0}));

      showBanner(`${label}!`,`${move.name} → ${move.target}`,"#06d6a0","✅");

      // Perfect minigame flavor
      if(score>=80 && isPlayer){ const fl=maybeFlavor("perfect_mg"); if(fl) addLog(fl,"flavor"); }
    }else{
      addLog(`✅ ${attacker.short} hits ${move.name} (${label})!`,"success");
      choreograph(dmg>7?"heavy":"strike", isPlayer);
      showBanner(`${label}!`,`${move.name} lands! (-${dmg} stamina)`,"#06d6a0","💥");
      // Stall tracking
      if(isPlayer) setEggStats(p=>({...p,stallTurns:p.stallTurns+1}));
    }

    // Momentum
    if(isPlayer){
      setPMom(p=>p+1);
      checkEggs("move",{score,moveName:move.name,moveCost:move.cost,isSub:false,isOnTop:r.pOnTop});
    }
    else setAMom(p=>p+1);
  },[showBanner,addLog,choreograph,checkEggs]);

  // ── DEFENSE MINIGAME RESULT ──
  const onDefenseMGDone=useCallback(({success,score,label})=>{
    setActiveMG(null);
    const def=pendingDefense;if(!def)return;setPendingDefense(null);
    const {move,isPlayer,score:atkScore,label:atkLabel,defCfg,attacker,defender}=def;
    const isPlayerDefending=!isPlayer;

    if(score>=80){
      // PERFECT defense — move completely stuffed
      addLog(`🛡️ ${defender.short} perfectly defends ${move.name}! (${defCfg.label})`,"defense");
      const fl=maybeFlavor("defense_success"); if(fl) addLog(fl,"flavor");
      if(isPlayer){setAStam(p=>Math.max(0,p-move.cost));}else{setPStam(p=>Math.max(0,p-move.cost));}
      if(isPlayerDefending) checkEggs("defense_success",{defenseScore:score});
      showBanner(defCfg.label,`${defender.short} completely stuffs ${move.name}!`,"#06d6a0","🛡️");
    }else if(success){
      // GOOD defense — partial success, lesser position
      const lesserTargets={
        [POS.SIDE_CONTROL]:POS.HALF_GUARD, [POS.MOUNT]:POS.SIDE_CONTROL,
        [POS.BACK_CONTROL]:POS.SIDE_CONTROL, [POS.HALF_GUARD]:POS.OPEN_GUARD
      };
      const lesser=lesserTargets[move.target]||move.target;
      addLog(`🛡️ ${defender.short} partially defends! → ${lesser} instead of ${move.target}`,"defense");
      const modMove={...move,target:lesser,dmg:Math.round(move.dmg*0.5)};
      applyPositionalMove(modMove,isPlayer,atkScore,atkLabel);
      return; // applyPositionalMove handles the banner
    }else{
      // MISS — defense fails, move succeeds fully
      addLog(`❌ ${defender.short}'s defense fails!`,"fail");
      applyPositionalMove(move,isPlayer,atkScore,atkLabel);
      return;
    }
  },[pendingDefense,showBanner,addLog,applyPositionalMove,checkEggs]);

  // ── BANNER DONE → advance turn ──
  const onBannerDone=useCallback(()=>{
    setBanner(null);
    const r=R.current;

    // TKO check
    if(r.pStam<=0){addLog(`💀 ${r.playerChar.short} is exhausted — TKO!`,"finish");setAAnim("win");setPAnim("lose");choreograph("tko",false);finishFight(false,"tko");return;}
    if(r.aStam<=0){addLog(`💀 ${r.aiChar.short} is exhausted — TKO!`,"finish");setPAnim("win");setAAnim("lose");choreograph("tko",true);finishFight(true,"tko");return;}

    // Track back control
    if(r.pos===POS.BACK_CONTROL&&!r.pOnTop) setStats(p=>({...p,wasTrappedBack:true}));

    // Low stamina flavor
    if(r.pStam<20){ const fl=maybeFlavor("low_stamina"); if(fl)addLog(fl,"flavor"); }

    // Standing turn tracking
    if(r.pos===POS.STANDING) setEggStats(p=>({...p,standingTurns:p.standingTurns+1}));
    else setEggStats(p=>({...p,standingTurns:0}));

    // Momentum check
    const wasPlayer=r.pTurn;
    const mom=wasPlayer?r.pMom:r.aMom;
    let nextIsPlayer;

    if(mom>=2){
      const fl=maybeFlavor("momentum"); 
      addLog(fl||`🔥 ${wasPlayer?r.playerChar.short:r.aiChar.short} rides the momentum! Extra turn!`,"momentum");
      if(wasPlayer)setPMom(0);else setAMom(0);
      nextIsPlayer=wasPlayer;
    }else{
      nextIsPlayer=!wasPlayer;
      setPTurn(!wasPlayer);
    }

    // Passive regen
    setPStam(p=>Math.min(100,p+1.5));setAStam(p=>Math.min(100,p+1.5));
    setTurnN(p=>p+1);

    // Turn-based easter eggs
    checkEggs("turn");

    if(nextIsPlayer) setPhase("player_pick"); else setPhase("ai_think");
  },[addLog,finishFight,choreograph,checkEggs]);

  // ── PLAYER PICKS MOVE ──
  const playerPickMove=useCallback((move)=>{
    if(R.current.pStam<move.cost)return;
    setPendingMove(move);
    const sv=R.current.playerChar.stats[move.stat]||5;
    setActiveMG({type:move.type,statVal:sv});
    setPhase("player_minigame");
  },[]);

  // ── PLAYER MINIGAME DONE ──
  const onPlayerMGDone=useCallback(({success,score,label})=>{
    setActiveMG(null);
    const move=pendingMove;if(!move)return;setPendingMove(null);
    resolveMove(move,true,success,score,label);
  },[pendingMove,resolveMove]);

  // ── SUBMISSION MINIGAME RESULT (both attack and defense) ──
  const onSubMinigameDone=useCallback(({success,score,label})=>{
    const sub=pendingSub;if(!sub)return;
    setPendingSub(null);
    const r=R.current;

    if(sub.isPlayerAttacking){
      if(success){
        setPAnim("win");setAAnim("tapOut");
        choreograph("submission",true,{text:"TAP OUT!"});
        addLog(`🏆 TAP! ${sub.attackerName} finishes with ${sub.move.subName}! (${label})`, "finish");
        finishFight(true,"submission",sub.move.subName);
      }else{
        choreograph("escape",false);
        const fl=maybeFlavor("sub_fail");
        addLog(fl||`🔒 ${sub.defenderName} escapes ${sub.move.subName}! (${label})`, "sub");
        showBanner("ESCAPED!",`${sub.defenderName} fights out of ${sub.move.subName}!`,"#f59e0b","💪",1600);
      }
    }else{
      if(success){
        choreograph("escape",true);
        const fl=maybeFlavor("escape_success");
        addLog(fl||`💪 ${sub.defenderName} escapes ${sub.move.subName}! (${label})`, "sub");
        showBanner("ESCAPED!",`${sub.defenderName} fights out of ${sub.move.subName}!`,"#06d6a0","💪",1600);
        checkEggs("sub_escape",{defenseScore:score});
      }else{
        setAAnim("win");setPAnim("tapOut");
        choreograph("submission",false,{text:"TAP OUT!"});
        addLog(`🏆 TAP! ${sub.attackerName} finishes with ${sub.move.subName}!`, "finish");
        finishFight(false,"submission",sub.move.subName);
      }
    }
  },[pendingSub,choreograph,addLog,finishFight,showBanner,checkEggs]);

  // ── AI THINK PHASE ──
  useEffect(()=>{
    if(phase!=="ai_think")return;
    // Phase 1: Show "thinking" for 1.3s
    const timer=setTimeout(()=>{
      const r=R.current;if(r.result)return;
      const d=AI_DIFF[r.diff];
      const moves=getMoves(r.aiChar,!r.pOnTop,r.pos);
      if(!moves.length){addLog(`${r.aiChar.short} stalls!`,"info");setPTurn(true);setPhase("player_pick");return;}

      // AI selection: prefer subs from dominant positions, otherwise weighted random
      let chosen;
      const dom=POS_DOM[r.pos]||0;
      const subs=moves.filter(m=>m.isSub);
      const hasSubs=subs.length>0;
      const isOnTop=!r.pOnTop; // AI is on top when player is NOT on top

      if(r.pStam<25&&hasSubs) chosen=pick(subs);
      else if(isOnTop&&dom>=4&&hasSubs&&Math.random()<0.5) chosen=pick(subs);
      else if(isOnTop&&dom>=3&&hasSubs&&Math.random()<0.3) chosen=pick(subs);
      else chosen=pick(moves);

      addLog(`🤖 ${r.aiChar.short} attempts ${chosen.name}...`,"ai");

      // Phase 2: Resolve after 1.1s (total ~2.4s for full AI turn visibility)
      setTimeout(()=>{
        if(R.current.result)return;
        // AI uses character stats to modify accuracy + score
        const aiStat=r.aiChar.stats[chosen.stat]||5;
        const statMod=(aiStat-5)*0.03; // +/- up to 0.15
        const roll=Math.random();
        const success=roll<(d.acc+statMod);
        const baseScore=success?randInt(50,100):randInt(0,40);
        const score=clamp(Math.round(baseScore+(aiStat-5)*2),0,100); // high stat → higher scores
        const label=score>=80?"PERFECT":score>=50?"GOOD":score>=20?"WEAK":"MISS";
        resolveMove(chosen,false,success,score,label);
      },1100);
    },1300);
    return()=>clearTimeout(timer);
  },[phase,getMoves,addLog,resolveMove]);


  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  // ── SPLASH SCREEN — FULL ARCADE MADNESS ──
  if(screen==="title" && !splashDone){
    return(
      <div className="ld-body min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={()=>setSplashDone(true)} onTouchStart={()=>setSplashDone(true)}
        style={{background:"#050508",animation:"crtBoot 1s ease-out both"}}>

        {/* ═══ LAYER 1: Animated shifting background ═══ */}
        <div className="absolute inset-0" style={{
          background:"radial-gradient(ellipse at 50% 50%, #1a0a0a 0%, #050508 50%, #0a0510 100%)",
          animation:"bgShift 8s ease-in-out infinite",backgroundSize:"200% 200%"}}/>

        {/* ═══ LAYER 2: Pulsing radial glows ═══ */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{
            background:"radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)",
            animation:"glowPulse 3s ease-in-out infinite"}}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full" style={{
            background:"radial-gradient(circle, rgba(247,127,0,0.1) 0%, transparent 60%)",
            animation:"glowPulse 4s 1s ease-in-out infinite"}}/>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full" style={{
            background:"radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 60%)",
            animation:"glowPulse 3.5s 2s ease-in-out infinite"}}/>
        </div>

        {/* ═══ LAYER 3: Converging speed lines ═══ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_,i)=>(
            <div key={`sl-${i}`} className="absolute h-[2px]" style={{
              top:`${8+i*7.5}%`,left:0,right:0,
              background:`linear-gradient(90deg, transparent 0%, ${i%3===0?'rgba(230,57,70,0.4)':i%3===1?'rgba(247,127,0,0.3)':'rgba(6,214,160,0.3)'} 50%, transparent 100%)`,
              animation:`speedConverge ${1.5+i*0.2}s ${0.8+i*0.08}s ease-out both`,
              "--sx":i%2===0?"-100%":"100%",opacity:0.5}}/>
          ))}
        </div>

        {/* ═══ LAYER 4: Diagonal slash marks ═══ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_,i)=>(
            <div key={`slash-${i}`} className="absolute w-[200%] h-[3px]" style={{
              top:`${30+i*20}%`,left:"-50%",
              background:`linear-gradient(90deg, transparent, ${['#e63946','#f77f00','#06d6a0'][i]}80, transparent)`,
              animation:`diagonalSlash ${2+i*0.5}s ${0.3+i*0.4}s ease-in-out both`}}/>
          ))}
        </div>

        {/* ═══ LAYER 5: Expanding ring pulses ═══ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[...Array(3)].map((_,i)=>(
            <div key={`ring-${i}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full" style={{
              border:`2px solid ${['#e63946','#f77f00','#06d6a0'][i]}`,
              animation:`ringPulse 3s ${1.8+i*1}s ease-out infinite`,opacity:0}}/>
          ))}
        </div>

        {/* ═══ LAYER 6: Light streaks across title ═══ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          <div className="absolute w-[150%] h-[60px] top-[42%] -left-[25%]" style={{
            background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.06) 55%, transparent 100%)",
            animation:"lightStreak 4s 2s ease-in-out infinite"}}/>
          <div className="absolute w-[60px] h-[150%] left-[48%] -top-[25%]" style={{
            background:"linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 55%, transparent 100%)",
            animation:"lightStreakV 5s 3s ease-in-out infinite"}}/>
          <div className="absolute w-[150%] h-[30px] top-[52%] -left-[25%]" style={{
            background:"linear-gradient(90deg, transparent 0%, rgba(230,57,70,0.08) 45%, rgba(230,57,70,0.2) 50%, rgba(230,57,70,0.08) 55%, transparent 100%)",
            animation:"lightStreak 6s 4s ease-in-out infinite"}}/>
        </div>

        {/* ═══ LAYER 7: Scanline CRT overlay ═══ */}
        <div className="absolute inset-0 pointer-events-none z-30" style={{
          background:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
          mixBlendMode:"overlay"}}/>

        {/* ═══ LAYER 8: Sparkle particles ═══ */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
          {[...Array(8)].map((_,i)=>(
            <div key={`sp-${i}`} className="absolute w-1 h-1 bg-white rounded-full" style={{
              top:`${20+Math.sin(i*1.3)*30}%`,left:`${15+i*10}%`,
              animation:`sparkle ${1.5+i*0.3}s ${2+i*0.5}s ease-in-out infinite`,
              boxShadow:"0 0 6px #fff, 0 0 12px rgba(230,57,70,0.5)"}}/>
          ))}
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="relative z-10 text-center" style={{animation:"titleBreathe 6s 2.5s ease-in-out infinite"}}>

          {/* ── "ULTRA" — chrome gradient with slam ── */}
          <div style={{
            animation:"subtitleSlam 0.6s 0.3s cubic-bezier(.22,1,.36,1) both",
            fontSize:"clamp(1rem, 4vw, 1.4rem)",fontWeight:900,
            letterSpacing:"0.5em",textTransform:"uppercase",
            background:"linear-gradient(90deg, #f77f00, #ffd166, #f77f00, #ffd166, #f77f00)",
            backgroundSize:"200% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"subtitleSlam 0.6s 0.3s cubic-bezier(.22,1,.36,1) both, chromePulse 3s 2s ease-in-out infinite",
            filter:"drop-shadow(0 0 15px rgba(247,127,0,0.6)) drop-shadow(0 2px 0 rgba(100,50,0,0.8))",
            marginBottom:8}}>
            ULTRA
          </div>

          {/* ── "GRAPPLE" — massive white with red edge glow ── */}
          <div style={{
            animation:"titleSlam 0.9s 0.5s cubic-bezier(.22,1,.36,1) both, textGlitch 8s 3s ease-in-out infinite",
            fontSize:"clamp(3.5rem, 14vw, 6rem)",fontWeight:900,
            lineHeight:0.85,letterSpacing:"-0.02em",
            color:"#fff",
            textShadow:`
              0 0 10px rgba(255,255,255,0.8),
              0 0 40px rgba(230,57,70,0.5),
              0 0 80px rgba(230,57,70,0.3),
              0 0 120px rgba(230,57,70,0.15),
              0 6px 0 #2a0a0e,
              0 8px 0 #1a0608,
              4px 0 0 rgba(230,57,70,0.3),
              -4px 0 0 rgba(6,214,160,0.2)
            `}}>
            GRAPPLE
          </div>

          {/* ── "FIGHTER" — massive red with chrome shine ── */}
          <div style={{
            animation:"titleSlam 0.9s 0.7s cubic-bezier(.22,1,.36,1) both, textGlitch 8s 5s ease-in-out infinite",
            fontSize:"clamp(3.5rem, 14vw, 6rem)",fontWeight:900,
            lineHeight:0.95,letterSpacing:"-0.02em",
            background:"linear-gradient(180deg, #ff4d5a 0%, #e63946 30%, #c1121f 60%, #8b0d16 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            filter:"drop-shadow(0 0 30px rgba(230,57,70,0.6)) drop-shadow(0 6px 0 rgba(26,6,8,0.9)) drop-shadow(4px 0 0 rgba(230,57,70,0.4)) drop-shadow(-3px 0 0 rgba(6,214,160,0.2))"}}>
            FIGHTER
          </div>

          {/* ── Divider bar — animated gradient ── */}
          <div className="mx-auto mt-4 mb-3 rounded-full overflow-hidden" style={{width:"clamp(200px,60vw,350px)",height:3}}>
            <div className="w-full h-full" style={{
              background:"linear-gradient(90deg, #e63946, #f77f00, #06d6a0, #f77f00, #e63946)",
              backgroundSize:"200% 100%",
              animation:"chromePulse 2s ease-in-out infinite",
              boxShadow:"0 0 15px rgba(230,57,70,0.5), 0 0 30px rgba(247,127,0,0.3)"}}/>
          </div>

          {/* ── "SUBMISSION EDITION" — reveal wipe with glow ── */}
          <div style={{
            animation:"editionReveal 0.8s 1.2s cubic-bezier(.22,1,.36,1) both",
            fontSize:"clamp(0.65rem, 2.5vw, 0.85rem)",fontWeight:800,
            letterSpacing:"0.4em",textTransform:"uppercase",
            background:"linear-gradient(90deg, #06d6a0, #34ebc6, #06d6a0, #34ebc6, #06d6a0)",
            backgroundSize:"200% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            animation:"editionReveal 0.8s 1.2s cubic-bezier(.22,1,.36,1) both, chromePulse 4s 2s ease-in-out infinite",
            filter:"drop-shadow(0 0 12px rgba(6,214,160,0.6)) drop-shadow(0 2px 0 rgba(0,50,30,0.8))"}}>
            — SUBMISSION EDITION —
          </div>

          {/* ── "TAP TO FIGHT" — aggressive pulse ── */}
          <div className="mt-12" style={{animation:"fadeIn 0.5s 2s ease-out both"}}>
            <div style={{
              fontSize:"clamp(1rem, 4vw, 1.3rem)",fontWeight:900,
              letterSpacing:"0.2em",color:"#eab308",
              animation:"tapFight 1.2s 2s ease-in-out infinite",
              textTransform:"uppercase"}}>
              TAP TO FIGHT
            </div>
          </div>
        </div>

        {/* ═══ CORNER DECORATIONS — glowing animated ═══ */}
        {[["top-3 left-3","border-t-2 border-l-2","#e63946"],["top-3 right-3","border-t-2 border-r-2","#f77f00"],
          ["bottom-3 left-3","border-b-2 border-l-2","#06d6a0"],["bottom-3 right-3","border-b-2 border-r-2","#e63946"]
        ].map(([pos,border,color],i)=>(
          <div key={`corner-${i}`} className={`absolute ${pos} w-10 h-10 ${border}`} style={{
            borderColor:color,color:color,
            animation:`cornerGlow 2s ${i*0.5}s ease-in-out infinite`}}/>
        ))}

        {/* ═══ BOTTOM TAGLINE ═══ */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-10" style={{animation:"fadeIn 1s 2.5s ease-out both"}}>
          <div className="text-gray-600 text-[9px] uppercase tracking-[0.3em] font-bold">Turn-Based BJJ Combat</div>
        </div>
      </div>
    );
  }

  // ── TITLE ──
  if(screen==="title"){
    const ch=todaysChallenge();
    return(
      <div className="ld-body min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-3xl"/>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"/>
          <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.025) 1px,transparent 0)",backgroundSize:"40px 40px"}}/>
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background:"repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)",
            mixBlendMode:"overlay"}}/>
        </div>
        <div className="relative z-10 text-center max-w-md w-full">
          <div className="text-[10px] uppercase tracking-[0.5em] text-orange-400 font-bold mb-1">Ultra</div>
          <h1 className="text-6xl font-black tracking-tight text-white leading-none" style={{textShadow:"0 0 80px rgba(230,57,70,0.3)"}}>GRAPPLE<br/><span style={{color:"#e63946"}}>FIGHTER</span></h1>
          <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold mt-1">— Submission Edition —</div>
          <div className="h-1 w-32 mx-auto mt-3 rounded-full" style={{background:"linear-gradient(90deg,#e63946,#f77f00,#06d6a0)"}}/>
          <p className="text-gray-400 mt-6 mb-8 leading-relaxed">Master positions. Execute submissions. Dominate the mat.</p>
          {loaded&&(record.wins>0||record.losses>0)&&(
            <div className="flex items-center justify-center gap-5 mb-6">
              {[["Wins",record.wins,"#06d6a0"],["Losses",record.losses,"#e63946"],["Streak",streak,"#f77f00"],["Subs",record.subs,"#7b2ff7"]].map(([l,v,c])=>(
                <div key={l} className="text-center"><div className="text-2xl font-black" style={{color:c}}>{v}</div><div className="text-gray-500 uppercase text-[10px] tracking-wider">{l}</div></div>
              ))}
            </div>
          )}
          <div className="mb-8 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-500 font-bold mb-1">⭐ Daily Challenge</div>
            <div className="text-white font-bold">{ch.name}</div>
            <div className="text-gray-400 text-sm">{ch.desc}</div>
          </div>
          <button onClick={()=>setScreen("select")} className="group relative px-14 py-4 rounded-xl font-black text-lg uppercase tracking-wider text-white overflow-hidden hover:scale-105 active:scale-95 transition-transform" style={{background:"linear-gradient(135deg,#e63946,#c1121f)"}}>
            <span className="relative z-10">Choose Fighter</span><div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
          </button>
        </div>
      </div>
    );
  }

  // ── CHARACTER SELECT ──
  if(screen==="select"){
    const hc = hoveredChar;
    return(
      <div className="ld-body min-h-screen p-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at 70% 60%, ${hc.color}08 0%, transparent 50%)`}}/>
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.02) 1px,transparent 0)",backgroundSize:"32px 32px"}}/>
        <div className="relative z-10 max-w-4xl mx-auto">
          <button onClick={()=>setScreen("title")} className="text-gray-500 hover:text-white transition-colors mb-3 text-sm">← Back</button>
          <div className="text-center mb-5">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-1">Choose Your</div>
            <h2 className="text-4xl font-black text-white tracking-tight">FIGHTER</h2>
            <div className="h-1 w-24 mx-auto mt-2 rounded-full" style={{background:"linear-gradient(90deg,#e63946,#f77f00,#06d6a0)"}}/>
          </div>

          <div className="flex gap-6 items-start">
            {/* LEFT: Portrait Grid */}
            <div className="grid grid-cols-2 gap-2 shrink-0" style={{width:180}}>
              {CHARS.map(c=>{
                const sel = hc.id===c.id;
                return(
                  <div key={c.id}
                    onMouseEnter={()=>!c.locked&&setHoveredChar(c)}
                    onClick={()=>{if(!c.locked){setPlayerChar(c);{const opts=CHARS.filter(x=>x.id!==c.id&&!x.locked);setAiChar(opts.length?pick(opts):MARCUS_ALT);}setScreen("difficulty");}}}
                    className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${c.locked?"opacity-30 cursor-not-allowed":sel?"scale-105 ring-2 ring-offset-1 ring-offset-gray-900":"hover:scale-102"}`}
                    style={{borderColor:sel?c.color:c.color+"30",background:sel?c.color+"15":"rgba(17,24,39,0.8)",
                      ringColor:c.color,aspectRatio:"1"}}>
                    {/* Fighter portrait */}
                    <div className="flex items-end justify-center h-full pt-1 pb-0.5" style={{background:sel?`radial-gradient(ellipse at 50% 100%, ${c.color}20 0%, transparent 70%)`:"none"}}>
                      {c.locked?(
                        <div className="flex items-center justify-center h-full w-full"><span className="text-2xl">🔒</span></div>
                      ):(
                        <Fighter char={c} size={70} facing="right" pose="idle"/>
                      )}
                    </div>
                    {/* Name strip */}
                    <div className="absolute bottom-0 left-0 right-0 py-0.5 text-center" style={{background:`linear-gradient(transparent, ${sel?c.color+"40":"rgba(0,0,0,0.7)"})`}}>
                      <div className="text-[10px] font-bold text-white truncate px-1">{c.short}</div>
                    </div>
                    {/* Selected indicator */}
                    {sel&&<div className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{background:c.color,boxShadow:`0 0 6px ${c.color}`}}/>}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Character Preview */}
            <div className="flex-1 flex gap-5">
              {/* Large fighter render */}
              <div className="flex flex-col items-center shrink-0" style={{width:180}}>
                <div className="relative" style={{background:`radial-gradient(ellipse at 50% 80%, ${hc.color}15 0%, transparent 60%)`}}>
                  <div className="anim-breathe">
                    <Fighter char={hc} size={170} facing="right" pose="idle"/>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <div className="text-[10px] uppercase tracking-widest" style={{color:hc.color}}>{hc.difficulty}</div>
                </div>
              </div>

              {/* Info panel */}
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-black text-white leading-tight">{hc.short}</div>
                <div className="text-sm font-bold mb-1" style={{color:hc.accent}}>"{hc.nick}" — {hc.style}</div>
                <div className="text-xs text-gray-400 mb-4 leading-relaxed">{hc.bio}</div>

                {/* Stats */}
                <div className="space-y-1.5 mb-4">
                  {Object.entries(hc.stats).map(([s,v])=>(
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[10px] w-20 text-gray-500 font-bold uppercase">{s}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{width:`${(v/10)*100}%`,background:v>=8?hc.color:v>=5?hc.color+"90":"#6b7280"}}/>
                      </div>
                      <span className="text-[10px] font-bold w-4 text-right" style={{color:v>=8?hc.color:"#9ca3af"}}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Signature move */}
                <div className="p-3 rounded-xl border" style={{borderColor:hc.color+"30",background:hc.color+"08"}}>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Signature Move</div>
                  <div className="text-sm font-bold" style={{color:hc.accent}}>{hc.sig.name}</div>
                  <div className="text-xs text-gray-400">{hc.sig.desc}</div>
                </div>

                {/* Select button */}
                {!hc.locked&&(
                  <button onClick={()=>{setPlayerChar(hc);{const opts=CHARS.filter(x=>x.id!==hc.id&&!x.locked);setAiChar(opts.length?pick(opts):MARCUS_ALT);}setScreen("difficulty");}}
                    className="mt-4 w-full px-6 py-3 rounded-xl font-bold text-lg uppercase tracking-wider text-white hover:brightness-110 active:scale-95 transition-all"
                    style={{background:`linear-gradient(135deg,${hc.color},${hc.color}cc)`}}>
                    SELECT {hc.short.toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DIFFICULTY ──
  if(screen==="difficulty"){
    const availableOpponents = CHARS.filter(c=>!c.locked);
    const opponentOptions = playerChar?.id==="marcus"
      ? [MARCUS_ALT, ...availableOpponents.filter(c=>c.id!==playerChar?.id)]
      : availableOpponents.filter(c=>c.id!==playerChar?.id);
    return(
      <div className="ld-body min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full text-center">
          <button onClick={()=>setScreen("select")} className="text-gray-500 hover:text-white transition-colors mb-6 text-sm">← Back</button>
          <div className="flex items-end justify-center gap-10 mb-6">
            <div className="text-center anim-fadeUp">
              <div className="anim-breathe">
                <Fighter char={playerChar} size={120} facing="right" pose="idle"/>
              </div>
              <div className="text-white font-bold text-sm mt-2">{playerChar?.short}</div>
              <div className="text-[10px]" style={{color:playerChar?.accent}}>YOU</div>
            </div>
            <div className="text-4xl font-black text-gray-600 mb-8 anim-popIn">VS</div>
            <div className="text-center anim-fadeUp" style={{animationDelay:"0.1s"}}>
              <div className="anim-breathe" style={{animationDelay:"1.5s"}}>
                <Fighter char={aiChar} size={120} facing="left" pose="idle"/>
              </div>
              <div className="text-white font-bold text-sm mt-2">{aiChar?.short}{aiChar?.isAlt?" (Alt)":""}</div>
              <div className="text-[10px]" style={{color:aiChar?.accent}}>CPU</div>
            </div>
          </div>
          {/* Opponent picker */}
          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Choose Opponent</div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button onClick={()=>setAiChar(pick(opponentOptions))}
                className="px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                style={{borderColor:"#6b728040",background:"#6b728010"}}>
                <span className="text-lg">🎲</span><span className="text-xs font-bold text-gray-400">Random</span>
              </button>
              {opponentOptions.map(c=>{
                const sel = aiChar?.id===c.id;
                return(
                  <button key={c.id} onClick={()=>setAiChar(c)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${sel?"scale-105":""}`}
                    style={{borderColor:sel?c.color:c.color+"30",background:sel?c.color+"15":"transparent"}}>
                    <Fighter char={c} size={28} facing="right" pose="idle"/>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white leading-tight">{c.short}{c.isAlt?" Alt":""}</div>
                      <div className="text-[9px]" style={{color:c.accent}}>{c.style.split(" ")[0]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <h2 className="text-xl font-black text-white mb-4">SELECT DIFFICULTY</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(AI_DIFF).map(([k,d])=>{const col=k==="easy"?"#06d6a0":k==="medium"?"#eab308":"#e63946";return(
              <button key={k} onClick={()=>startFight(k)} className="p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98]" style={{borderColor:col+"30",background:col+"08"}} onMouseEnter={e=>e.currentTarget.style.borderColor=col} onMouseLeave={e=>e.currentTarget.style.borderColor=col+"30"}>
                <div className="flex items-center justify-between"><div><div className="text-lg font-bold" style={{color:col}}>{d.name}</div><div className="text-xs text-gray-400 mt-0.5">{d.desc}</div></div><div className="text-2xl">{d.emoji}</div></div>
              </button>
            );})}
          </div>
        </div>
      </div>
    );
  }

  // ── FIGHT ──
  if(screen==="fight"){
    const playerMoves=phase==="player_pick"?getMoves(playerChar,pOnTop,pos):[];
    const stCol=p=>p>60?"#06d6a0":p>30?"#fca311":"#e63946";
    const topLabel=(isP)=>{
      if(isNeutralPos(pos)) return "";
      return isP?(pOnTop?" · TOP":" · BTM"):(!pOnTop?" · TOP":" · BTM");
    };

    return(
      <div className="ld-body min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.012) 1px,transparent 0)",backgroundSize:"24px 24px"}}/>

        {/* ── TOP HUD ── */}
        <div className="relative z-10 p-3 border-b border-gray-800/80 bg-gray-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            {/* Player HUD */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{background:playerChar?.color+"25",border:`2px solid ${playerChar?.color}`,color:playerChar?.color}}>{playerChar?.short[0]}</div>
                <div>
                  <div className="text-sm font-bold text-white">{playerChar?.short}</div>
                  <div className="text-[10px]" style={{color:playerChar?.accent}}>YOU{topLabel(true)}</div>
                </div>
                {pTurn&&phase!=="grip_fight"&&<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">YOUR TURN</span>}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{width:`${pStam}%`,background:stCol(pStam)}}/></div>
              <div className="flex items-center gap-1 text-[10px] mt-0.5">
                <span className="text-gray-500">STA</span><span className="font-bold" style={{color:stCol(pStam)}}>{Math.round(pStam)}</span>
                {pMom>0&&<span className="ml-1 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">🔥x{pMom}</span>}
              </div>
            </div>
            <div className="text-center shrink-0 px-3"><div className="text-[10px] text-gray-500 uppercase tracking-widest">Turn</div><div className="text-xl font-black text-white">{turnN}</div></div>
            {/* AI HUD */}
            <div className="flex-1 text-right">
              <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{background:aiChar?.color+"25",border:`2px solid ${aiChar?.color}`,color:aiChar?.color}}>{aiChar?.short[0]}</div>
                <div>
                  <div className="text-sm font-bold text-white text-right">{aiChar?.short}</div>
                  <div className="text-[10px] text-right" style={{color:aiChar?.accent}}>CPU{topLabel(false)}</div>
                </div>
                {!pTurn&&phase!=="grip_fight"&&<span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 ${phase==="ai_think"?"animate-pulse":""}`}>OPP TURN</span>}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full transition-all duration-500 ml-auto" style={{width:`${aStam}%`,background:stCol(aStam)}}/></div>
              <div className="flex items-center gap-1 text-[10px] mt-0.5 justify-end">
                {aMom>0&&<span className="mr-1 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">🔥x{aMom}</span>}
                <span className="font-bold" style={{color:stCol(aStam)}}>{Math.round(aStam)}</span><span className="text-gray-500">STA</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ARENA ── */}
        <div className="relative z-10 flex flex-col md:flex-row max-w-5xl mx-auto w-full flex-1 p-3 gap-3 overflow-hidden">
          {/* Left: Fighters + Position + Log */}
          <div className="md:w-1/2 flex flex-col gap-2">
            {/* Position status — prominent */}
            {(()=>{
              const posEmojis = {"Standing":"🧍","Clinch":"🤼","Scramble":"🌀","Closed Guard":"🛡️","Open Guard":"🦵","Butterfly Guard":"🦋","Half Guard":"⚔️","Turtle":"🐢","Side Control":"📌","Mount":"⛰️","Back Control":"🎯"};
              const neutral = isNeutralPos(pos);
              const playerWinning = pOnTop && !neutral;
              const aiWinning = !pOnTop && !neutral;
              const dom = POS_DOM[pos]||0;
              const domColor = neutral ? "#6b7280" : playerWinning ? "#06d6a0" : "#e63946";
              return (
                <div className="rounded-xl border overflow-hidden" style={{borderColor:domColor+"40",background:`linear-gradient(135deg, ${domColor}08, ${domColor}15)`}}>
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{posEmojis[pos]||"🤼"}</span>
                      <div>
                        <div className="text-lg font-black tracking-tight" style={{color:domColor}}>{pos.toUpperCase()}</div>
                        <div className="text-[10px] text-gray-400 -mt-0.5">
                          {neutral?"Neutral Position"
                            :playerWinning?<span><span className="font-bold text-green-400">YOU</span> are on top — {dom>=4?"Dominant!":dom>=3?"Strong position":dom>=2?"Advantaged":"Slight edge"}</span>
                            :<span><span className="font-bold text-red-400">{aiChar?.short}</span> is on top — {dom>=4?"Danger!":dom>=3?"Bad position":dom>=2?"Disadvantaged":"Slight disadvantage"}</span>
                          }
                        </div>
                      </div>
                    </div>
                    {!neutral && (
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="text-[9px] uppercase tracking-wider font-bold" style={{color:domColor}}>
                          {playerWinning?"ADVANTAGE":"DANGER"}
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i=>(
                            <div key={i} className="w-3 h-1.5 rounded-sm transition-all duration-500" style={{
                              background: i<=dom ? domColor : "#374151",
                              opacity: i<=dom ? 1 : 0.3
                            }}/>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            {/* Fighter arena */}
            {(()=>{
              const layout = POS_LAYOUT[pos] || POS_LAYOUT[POS.STANDING];
              const neutral = isNeutralPos(pos);
              // Player is always "left side" visually. If on top in ground pos, use top layout.
              const pLayout = pOnTop || neutral ? layout.top : layout.btm;
              const aLayout = !pOnTop || neutral ? layout.top : layout.btm;
              // For neutral: player left (mirror x), AI right (as-is)
              const pX = neutral ? (100 - layout.top.x) : (100 - pLayout.x);
              const aX = neutral ? layout.top.x : aLayout.x;
              const pY = pLayout.y;
              const aY = aLayout.y;
              const pZ = pOnTop || neutral ? 2 : 1;
              const aZ = !pOnTop || neutral ? 2 : 1;
              const pSz = pLayout.sz;
              const aSz = aLayout.sz;
              const pRot = neutral ? 0 : pLayout.rot;
              const aRot = neutral ? 0 : -aLayout.rot;

              return (
                <div className={`bg-gray-900/60 border-2 rounded-xl relative overflow-hidden ${arenaShake}`}
                  style={{minHeight:250,background:"linear-gradient(180deg, rgba(3,7,18,0.6) 0%, rgba(17,24,39,0.4) 100%)",
                    borderColor:phase==="ai_think"?(aiChar?.color+"40"):"#1f293780",
                    transition:"border-color 0.5s",
                    boxShadow:phase==="ai_think"?`inset 0 0 30px ${aiChar?.color}08`:"none"}}>
                  {/* Arena floor */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/30 to-transparent"/>
                  <ImpactFlash color={flashColor} active={!!flashColor}/>
                  <SlamText text={slamText?.text} color={slamText?.color} active={!!slamText}/>
                  <DustBurst active={dustActive}/>

                  {/* Player fighter — position-aware */}
                  <div className="absolute transition-all duration-700 ease-out" style={{
                    left:`${pX}%`, top:`${pY}%`, zIndex:pZ,
                    transform:`translate(-50%,-50%) rotate(${pRot}deg)`
                  }}>
                    <Fighter char={playerChar} size={pSz} facing="right" isAttacking={pAttacking}
                      pose={pAnim!=="idle"?pAnim:resolveSprite(playerChar,{position:pos,isOnTop:pOnTop,stamina:pStam,isMinigame:phase==="player_minigame"||phase==="defense_minigame",animState:pAnim})}/>
                  </div>

                  {/* AI fighter — position-aware */}
                  <div className="absolute transition-all duration-700 ease-out" style={{
                    left:`${aX}%`, top:`${aY}%`, zIndex:aZ,
                    transform:`translate(-50%,-50%) rotate(${aRot}deg)`
                  }}>
                    <Fighter char={aiChar} size={aSz} facing="left" isAttacking={aAttacking}
                      pose={aAnim!=="idle"?aAnim:resolveSprite(aiChar,{position:pos,isOnTop:!pOnTop,stamina:aStam,isMinigame:false,animState:aAnim})}/>
                  </div>
                </div>
              );
            })()}
            {/* Position map + Log side by side */}
            <div className="flex gap-3 flex-1 min-h-0">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2 flex justify-center shrink-0" style={{width:140}}><PositionMap current={pos} playerChar={playerChar} aiChar={aiChar}/></div>
              <div className="flex-1 bg-gray-900/60 border border-gray-800 rounded-xl flex flex-col min-h-0">
                <div className="px-3 py-1.5 border-b border-gray-800"><div className="text-[10px] text-gray-500 uppercase tracking-widest">Combat Log</div></div>
                <div ref={logRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-40 md:max-h-none">
                  {log.map(l=>(
                    <div key={l.id} className={`text-[11px] px-2 py-0.5 rounded anim-fadeIn ${
                      l.type==="finish"?"bg-yellow-500/10 text-yellow-300 font-bold":
                      l.type==="success"?"text-green-400":l.type==="fail"?"text-red-400":
                      l.type==="sub"?"text-amber-400 font-semibold":l.type==="ai"?"text-orange-400":
                      l.type==="momentum"?"text-orange-300 font-semibold":"text-gray-400"}`}>{l.msg}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Moves panel */}
          <div className="md:w-1/2 flex flex-col">
            {phase==="player_pick"?(
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex-1 anim-fadeUp">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Your Moves</div>
                  <div className="text-[10px] text-gray-600">{pos}{!isNeutralPos(pos)&&(pOnTop?" (You: Top)":" (You: Bottom)")}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {playerMoves.map((m,i)=>{
                    const afford=pStam>=m.cost;
                    return(
                      <button key={i} onClick={()=>afford&&playerPickMove(m)} disabled={!afford}
                        className={`p-3 rounded-xl border text-left transition-all ${afford?"border-gray-700 hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/80 active:scale-[0.97] cursor-pointer":"border-gray-800/50 bg-gray-900/30 opacity-30 cursor-not-allowed"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-white">{m.name}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{m.desc}</div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {m.isSub&&<span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">SUB</span>}
                            <span className={`text-[11px] font-mono ${afford?"text-yellow-400":"text-red-400"}`}>⚡{m.cost}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            m.type==="sequence"?"bg-blue-500/20 text-blue-300":m.type==="power"?"bg-yellow-500/20 text-yellow-300":
                            m.type==="timing"?"bg-green-500/20 text-green-300":"bg-orange-500/20 text-orange-300"}`}>
                            {m.type==="sequence"?"↑↓ SEQ":m.type==="power"?"⚡ PWR":m.type==="timing"?"🎯 TIME":"👊 TAP"}
                          </span>
                          {m.target&&m.target!==pos&&<span className="text-[10px] text-gray-500">→ {m.target}</span>}
                          {m.dmg>0&&<span className="text-[10px] text-red-400/70">-{m.dmg} dmg</span>}
                          {m.isSub&&<span className="text-[10px] text-red-300/70">PERFECT = instant tap</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ):phase==="ai_think"?(
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 flex-1 flex items-center justify-center" style={{borderColor:aiChar?.color+"30"}}>
                <div className="text-center anim-fadeIn">
                  <div className="anim-breathe mb-3">
                    <Fighter char={aiChar} size={100} facing="left" pose="effort"/>
                  </div>
                  <div className="text-lg font-bold text-white">{aiChar?.short}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-sm" style={{color:aiChar?.color}}>Thinking</span>
                    <span className="flex gap-0.5">
                      {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:aiChar?.color,animationDelay:`${i*0.3}s`}}/>)}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2">Opponent's turn — watch the log</div>
                </div>
              </div>
            ):phase==="done"?(
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 flex-1 flex items-center justify-center">
                <div className="text-center anim-popIn"><div className="text-6xl mb-3">{result?.won?"🏆":"💀"}</div>
                  <div className="text-3xl font-black text-white">{result?.won?"VICTORY!":"DEFEATED"}</div>
                </div>
              </div>
            ):(
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 flex-1 flex items-center justify-center">
                <div className="text-gray-600 text-sm">Waiting...</div>
              </div>
            )}
          </div>
        </div>

        {/* Overlays */}
        {phase==="grip_fight"&&playerChar&&aiChar&&<GripFightMinigame playerChar={playerChar} aiChar={aiChar} onComplete={onGripFightDone}/>}

        {phase==="player_minigame"&&activeMG&&(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl anim-slideDown">
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-white">{pendingMove?.name}</div>
                <div className="text-sm text-gray-400">{pendingMove?.desc}</div>
                {pendingMove?.isSub&&<div className="text-xs text-red-400 mt-1">🔒 PERFECT = Instant Tap!</div>}
              </div>
              {activeMG.type==="sequence"&&<SequenceMinigame onComplete={onPlayerMGDone} statBonus={activeMG.statVal}/>}
              {activeMG.type==="power"&&<PowerMeterMinigame onComplete={onPlayerMGDone} statBonus={activeMG.statVal}/>}
              {activeMG.type==="timing"&&<TimingRingMinigame onComplete={onPlayerMGDone} statBonus={activeMG.statVal}/>}
              {activeMG.type==="tap"&&<RapidTapMinigame onComplete={onPlayerMGDone} statBonus={activeMG.statVal}/>}
            </div>
          </div>
        )}

        {phase==="sub_minigame"&&pendingSub&&(
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-900 border-2 rounded-2xl p-6 max-w-md w-full shadow-2xl anim-slideDown`}
              style={{borderColor:pendingSub.isPlayerAttacking?"#e6394640":"#06d6a040",
                boxShadow:`0 0 60px ${pendingSub.isPlayerAttacking?"rgba(230,57,70,0.15)":"rgba(6,214,160,0.15)"}`}}>
              <div className="text-center mb-4">
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1"
                  style={{color:pendingSub.isPlayerAttacking?"#e63946":"#06d6a0"}}>
                  {pendingSub.isPlayerAttacking?"⚔️ FINISH THE SUBMISSION":"🛡️ DEFEND THE SUBMISSION"}
                </div>
                <div className="text-lg font-bold text-white">{pendingSub.move.subName}</div>
                <div className="text-sm text-gray-400">
                  {pendingSub.isPlayerAttacking
                    ?`Lock it in on ${pendingSub.defenderName}!`
                    :`${pendingSub.attackerName} has you locked up! Escape!`}
                </div>
              </div>
              <SubmissionMinigame
                isAttacking={pendingSub.isPlayerAttacking}
                attackerName={pendingSub.attackerName}
                defenderName={pendingSub.defenderName}
                difficulty={pendingSub.difficulty}
                onComplete={onSubMinigameDone}/>
            </div>
          </div>
        )}

        {/* Defense minigame */}
        {phase==="defense_minigame"&&activeMG&&pendingDefense&&(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-yellow-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl anim-slideDown"
              style={{boxShadow:"0 0 60px rgba(234,179,8,0.15)"}}>
              <div className="text-center mb-4">
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-yellow-400 mb-1">🛡️ {pendingDefense.defCfg.label}</div>
                <div className="text-lg font-bold text-white">Defend {pendingDefense.move.name}!</div>
                <div className="text-sm text-gray-400">{pendingDefense.defCfg.desc}</div>
              </div>
              {activeMG.type==="sequence"&&<SequenceMinigame onComplete={onDefenseMGDone} statBonus={activeMG.statVal}/>}
              {activeMG.type==="power"&&<PowerMeterMinigame onComplete={onDefenseMGDone} statBonus={activeMG.statVal}/>}
              {activeMG.type==="timing"&&<TimingRingMinigame onComplete={onDefenseMGDone} statBonus={activeMG.statVal}/>}
              {activeMG.type==="tap"&&<RapidTapMinigame onComplete={onDefenseMGDone} statBonus={activeMG.statVal}/>}
            </div>
          </div>
        )}

        {phase==="banner"&&banner&&<Banner text={banner.text} subtext={banner.subtext} color={banner.color} icon={banner.icon} onDone={onBannerDone} duration={banner.dur}/>}

        {/* Easter egg toast */}
        {toast&&(
          <div className="fixed bottom-4 right-4 z-[60] anim-slideUp" style={{animation:"slideUp 0.3s ease-out, slideDown 0.3s ease-in 2.5s forwards"}}>
            <div className="bg-gray-900/95 border-2 border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl backdrop-blur-sm" style={{boxShadow:"0 0 30px rgba(234,179,8,0.1)"}}>
              <span className="text-2xl">{toast.icon}</span>
              <div>
                <div className="text-sm font-bold text-yellow-300">{toast.text}</div>
                <div className="h-1 bg-gray-700 rounded-full mt-1.5 overflow-hidden" style={{width:120}}>
                  <div className="h-full bg-yellow-500 rounded-full" style={{animation:"shrink 2.5s linear forwards"}}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULT ──
  if(screen==="result"){
    const ch=todaysChallenge();
    return(
      <div className="ld-body min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {result?.won&&<div className="absolute inset-0"><div className="absolute top-1/4 left-1/3 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"/><div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"/></div>}
        <div className="relative z-10 text-center max-w-md w-full anim-fadeUp">
          <div className="flex items-end justify-center gap-12 mb-4">
            <div className="text-center">
              <Fighter char={playerChar} size={120} facing="right" pose={result?.won?"win":"lose"}/>
              <div className="text-sm font-bold mt-1" style={{color:playerChar?.color}}>{playerChar?.short}</div>
            </div>
            <div className="text-center">
              <Fighter char={aiChar} size={120} facing="left" pose={result?.won?"lose":"win"}/>
              <div className="text-sm font-bold mt-1" style={{color:aiChar?.color}}>{aiChar?.short}</div>
            </div>
          </div>
          <div className="text-6xl mb-2">{result?.won?"🏆":"💀"}</div>
          <h2 className={`text-4xl font-black mb-2 ${result?.won?"text-yellow-400":"text-red-400"}`}>{result?.won?"VICTORY":"DEFEAT"}</h2>
          <div className="text-gray-400 mb-6">{result?.finish==="submission"?`Won by ${result?.subName}`:result?.finish==="tko"?"TKO (Exhaustion)":"Match Complete"}</div>
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
            <div className="text-center"><div className="text-2xl font-black text-white">{turnN}</div><div className="text-[10px] text-gray-500 uppercase">Turns</div></div>
            <div className="text-center"><div className="text-2xl font-black text-orange-400">{streak}</div><div className="text-[10px] text-gray-500 uppercase">Streak</div></div>
            <div className="text-center"><div className="text-2xl font-black text-green-400">{record.wins}-{record.losses}</div><div className="text-[10px] text-gray-500 uppercase">Record</div></div>
          </div>
          <div className={`p-4 rounded-xl border mb-6 ${chalDone?"border-yellow-500/30 bg-yellow-500/10":"border-gray-800 bg-gray-900"}`}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:chalDone?"#eab308":"#6b7280"}}>{chalDone?"⭐ Challenge Complete!":"Daily Challenge"}</div>
            <div className="text-white font-bold">{ch.name}</div><div className="text-gray-400 text-sm">{ch.desc}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>{checkEggs("rematch");startFight(diff);}} className="flex-1 px-6 py-3 rounded-xl font-bold text-lg uppercase tracking-wider text-white hover:scale-[1.02] active:scale-95 transition-transform" style={{background:"linear-gradient(135deg,#e63946,#c1121f)"}}>Rematch</button>
            <button onClick={()=>setScreen("select")} className="flex-1 px-6 py-3 rounded-xl font-bold text-lg uppercase tracking-wider text-white bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:scale-[1.02] active:scale-95 transition-all">New Fight</button>
          </div>
          <button onClick={()=>setScreen("title")} className="mt-3 text-sm text-gray-500 hover:text-white transition-colors">← Main Menu</button>
        </div>
      </div>
    );
  }

  return null;
}
