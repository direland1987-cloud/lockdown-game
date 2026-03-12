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
  TURTLE:"Turtle", MOUNT:"Mount", BACK_CONTROL:"Back Control", SCRAMBLE:"Scramble",
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

const CHARS = [
  { id:"marcus", name:'Marcus "The Bull" Reyes', short:"Marcus", nick:"The Bull", style:"Pressure Wrestler", difficulty:"EASY",
    bio:"Relentless top-pressure grappler. Smothers from top. Great for beginners.",
    color:"#e63946", accent:"#ff6b6b", locked:false,
    stats:{takedowns:9,guard:4,passing:8,submissions:7,escapes:5,strength:10,speed:8,stamina:9},
    sig:{name:"The Freight Train",type:"sequence",desc:"Double-leg takedown with 2-stage minigame"},
    skin:"#D4956A",hair:"#1a1a1a",shorts:"#e63946",belt:"#8B4513"
  },
  { id:"yuki", name:'Yuki "Spider" Tanaka', short:"Yuki", nick:"Spider", style:"Technical Guard Player", difficulty:"HARD",
    bio:"Technical wizard, most dangerous off her back. Deadly triangles and intricate guard.",
    color:"#7b2ff7", accent:"#b57bff", locked:false,
    stats:{takedowns:3,guard:10,passing:5,submissions:10,escapes:8,strength:4,speed:9,stamina:8},
    sig:{name:"The Web",type:"timing",desc:"Triple-threat triangle/armbar/omoplata combo"},
    skin:"#F5D6B8",hair:"#0a0a2e",shorts:"#7b2ff7",belt:"#6B3FA0"
  },
  { id:"darius", name:'Darius "The Ghost" Okeke', short:"Darius", nick:"The Ghost", style:"Counter Fighter", difficulty:"MEDIUM",
    bio:"Patient and elusive. Waits for mistakes, punishes hard. Supernatural escapes.",
    color:"#06d6a0", accent:"#64ffda", locked:true,
    stats:{takedowns:6,guard:7,passing:6,submissions:7,escapes:10,strength:6,speed:9,stamina:9},
    sig:{name:"Ghost Escape",type:"timing",desc:"Impossible escape from any bottom position"},
    skin:"#8B6914",hair:"#0a0a0a",shorts:"#06d6a0",belt:"#2D7A5F"
  },
  { id:"diego", name:'"Loco" Diego Vega', short:"Diego", nick:"Loco", style:"Wild Card Scrambler", difficulty:"MEDIUM",
    bio:"Unpredictable scrambler. Every position is dangerous. You never know what's coming.",
    color:"#f77f00", accent:"#fca311", locked:true,
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
  ],
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
  advance:  { baseRate:0.25, defStat:"escapes", mgType:"timing", label:"BLOCK!",  desc:"Block the transition!" },
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
  ],
};
const maybeFlavor=(key)=>Math.random()<0.12?pick(FLAVOR_TEXT[key]||[]):null;

const AI_DIFF = {
  easy:   { acc:0.40, defMod:-2, name:"White Belt",  emoji:"🟢", desc:"Slower reactions, more mistakes" },
  medium: { acc:0.62, defMod:0,  name:"Purple Belt", emoji:"🟡", desc:"Balanced challenge" },
  hard:   { acc:0.82, defMod:3,  name:"Black Belt",  emoji:"🔴", desc:"Near-perfect execution, ruthless" },
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
  [POS.BACK_CONTROL]: {x:75,y:66,emoji:"🎯"},
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
  [POS.BACK_CONTROL]:{ top:{x:48,y:42,z:2,sz:160,rot:-6},    btm:{x:52,y:60,z:1,sz:130,rot:10} },
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
async function load(k,fb){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):fb}catch{return fb}}
async function save(k,v){try{await window.storage.set(k,JSON.stringify(v))}catch(e){console.error(e)}}


const SPRITE_DATA = {
  "marcus_idle": "data:image/webp;base64,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",
  "marcus_win": "data:image/webp;base64,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",
  "marcus_lose": "data:image/webp;base64,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",
  "marcus_mountTop": "data:image/webp;base64,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",
  "marcus_mountBtm": "data:image/webp;base64,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",
  "marcus_backTop": "data:image/webp;base64,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",
  "marcus_pressTop": "data:image/webp;base64,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",
  "marcus_tired": "data:image/webp;base64,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",
  "marcus_guardTop": "data:image/webp;base64,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",
  "marcus_guardBtm": "data:image/webp;base64,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",
  "marcus_tapOut": "data:image/webp;base64,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",
  "marcus_effort": "data:image/webp;base64,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",
  "yuki_idle": "data:image/webp;base64,UklGRsIEAABXRUJQVlA4WAoAAAAQAAAAQAAAcwAAQUxQSBsAAAABDzD/ERFCURsp0PoXfQIK+ET0fwJwU/vnuwEAVlA4IIAEAAAwFQCdASpBAHQAPmEukkckIqGhJbkqaIAMCUAaYiizmegPMr5Y52HmAc57zHdFXemXzX+T/HTKgPp+EH1KeTTd9+5ecHcecUXQA8SHOk9R+wP+ufWP9FUpgQZmeDHvpqkk4GuykJUE9akRtEI9yD516kXPQG4vxpR5PWleemXhC+ObLg2fGDeaeo5KChO1ZIgnxo+GMN1JcnnYYLYeOYk82v2R/xLe80p2d1Cl8ogSzoyAAP79Noc154cfKcjvkJ8LDgY/BYeePvtCB3gj8Oht/vpjroL257/XQ8y12F1zU5HyWj9+x4R6tveOw5VmuU5LdZrmh3/9EX8wKmkC6GYZ5QKokXqnQUEG/GTWd7s/OzTJAxAsq4PqFZm7SFLbAhsEZiI2hTaPpGV+PEwYIHhtqYwBaEnSvuEu7JgHN9JDUcIWuGhpGJ0vgzVe8vwmBvTweVz1GY1FxR4oi7hCJFNau3segXjfgrpBn8xM9RRdMqlZsziPa6t+ousVUGsXf0PQZpLlHMNTPe6hqPK1f3EpETL9zyRm7I8R9EcT4gplrh7fP/+EVq9td0PGwAfYpVXf0sbr+i4xzPuf+Vqd5yCqHgh0uqLphtfrGfhYFYPar/knsC38/FGSrHkvlCEM2d4plCga2HaQt5Vu2+0O1jK3HLz++f7/Pc0e8pEu+RROepXkq+q53+FtL2J5zFacLRa0cz45F/ydQYlEMelOVi+GRcPvD98z/ro8PFkzPtdl1khet15TgDt2IOBjNpL4qL1Z/6Qdv0asJy/9C3++DCN17YTxIUdy0TzL+on/tlf3GQ6Je63oN6x+K/f0VFKPc9GgqNqkGHHOUwBxo/VOozKPG22U7EyQPqJ0jgYDv5OJeO7MtIiTDmjrwudb2mPrWC6T4lWLUxk56hTNioqszdB29ctL52pte/gfa7E/s+9fN/x6bxLBqMevEoYyMaUyhh+i3nov78LDfa9SpzS7LFN4INUIA97UJqostuH1fr3FO5kODtFna1Qu/cwdt3EegLdMkfqMOfuy56QuMviU8natqzFNKkDk1hV52YUvXuZZV708DgnWrm7x40RZJaWpk6dtKIaIBPny+7w9w6vXttBBnj23S78U0JRdDI80m2wJPAl8G1X/EVOu7w8oleWOFq1FxtMmHYJteLLLAftzoeYEQo48fdDZehkeAL3aYXTd3ncwY4AAkvrSx4fv+rL934H6XUO9u4uTJy62c/M9K+iWse56Lcqfm6/UmNAvwtuh9vXW1t2YtlTrcJbRHTHQN07spxPx2eEOtDvJrumFT3zIb6+SGH2elwqUNOx1USc5SmgCo0ZSq8Wj9VqCR8/afQECk26KSyg4P2iycByvtrGgu05thJMW7ncqEDmolQetFPs2LSeVpMGnhEyaNj+4D827hLIO2Z+1AX5vSBRjd/rf/eEAm8DYhRpUdQDTB8K5TUzSBLOcl/OXwueSVx8v9cHPV36fNycoetxPIBzJ+7QOQdWdCUq5EfQxMUn9I+f8L1vOTAOxFnn6dLwBHCAAAAA=",
  "yuki_effort": "data:image/webp;base64,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",
  "yuki_tired": "data:image/webp;base64,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",
  "yuki_tapOut": "data:image/webp;base64,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",
  "yuki_mountBtm": "data:image/webp;base64,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",
  "yuki_triangle": "data:image/webp;base64,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",
  "marcus_idle2": "data:image/webp;base64,UklGRoQdAABXRUJQVlA4WAoAAAAQAAAAcwAATAAAQUxQSAwOAAAB0IZt2zFJsnVdz/O+7/cFkmVNdfdMa9RYNgdrbdu2bdu2bdu297Jtq1GZGRHvj++LyMX/ETEBfA8tHuLcGAaq1AUEsACvExCOZUYPiASk7ltxNOxxIvBKBXIfMVMSsaStrUYHoAqGy9ynrUm0mOwNWUbNGIjFjMGRgAFEFSzCCwFGGVDEuVmVQhuReaOMQTgDrQJ6DQcjLBh7Ynjrj1gSToL9AmYKIIIgYAOiwUSB2gKoZcbEZK8YAFqYn8PgxocsQiHKMBE4VXIglqVhKrGgEAXMyu2bViQfl6x+3G0EgUwelNUNap07ZXVEYSzluRzNI1anNmU4dbXgbefIen3yjoKuEggsRnNoYKWMww3PBmEhUNbMSwsKOBSLEGSpJRIdqmoKyK27KFOnZch1IJEIEAEsKwGBIni6zvGmpwVtCFnDs1y8bwlOIQNQZFZt41JSptEGkfunNjGqDCXAyEoAKCgoYEAsVgEIKNPFkZ7W+tYKEAUt8NQS5Pmf9rv/yV/8ES8N4liDWc2iuh5JJJKIG2N9Cxqyfx1MBWR8mkwC2f/Ku5H9FteBfNQY8hNfu+y9X732d6yFcA7aiMh+WX7knWe/L3UY44B3NoJ5AQE5UCMBn6oCRGimtJHzr+8XV5vNpvcfQpqEMypTM5Rp8HBZ0rPTPAAEEAmBGK0eMBUrxAzBOPCzH8Hjy02fXvXfycCK43EGRYBCiqhBnjoQ9YBgXgDRVhLKcAgSwYEaLx8XPnlzNbO5+v7kGNSYkVmD/SISKQJOri9CGAcRBZzTUgDqb+mbuddfoJZgr+HkUImJiRwo7hGS0EqBwEkIZGU2ggrceN8P/ZF/66LPb197msC5kFb3xQyIxKgV9xhcX9kvVA6W9S/83f+xH7rt31ydzkAJZmVWAGVeUAApQWiwKEAUpgpk4e47CAQEcsEv+h+996uLJ1e7uV3/pmQqJC8+g5Ngv0FL0qeWrtgfgRmQSSZqTpxpJW8/vF1UFKLw/if98uJy1w/dbv/0x/+5L/mbLylyev4uckT2xhCxog6Fo2I5oCmOOQhEKrMGEMXGsx9tJqAcefN/7570b+cvf4VisPq4xVq5feSUGKzt9NkVAXJoABytXXncqFyzcHTSTgQEgp/b3+zfjpvLze6N/hfHTKzcvk07++B7SEsgms+dWShJxT1HZSJWWuKe4gwx3rk3BJmAxh/bPfn2mO623/QuErICq5cBDIgQMdWhBAgCBZDluRwusxEoIhMeflq/+vba9G94NwFBFqIh0xhAlHAWiMk501qLFBFQ5i2SzGZK8FLf7r79vuZFgorMGpgisKhWFTlwiQSZKNMUUAVDAkKoavDJ/apf+2o70zf94wk9T51pCGi0JEyNiXM0kHZ81EiRoQCNLAAKFBVAfmJ/cr3edzNP+vclyacyEYKU2XEElo0AlPl/WAmixHlDUYMIUQghAsIoQPD+6223//Qz+2Zy0X8rYJQYktCgBGggT50FCLL3LCUp2T7A6uJt1IKAweziJkOigPzIa11efo6/qF/ueu9Pdn9EiMJqVe9yzVof3EOQA2UqYVBOSQGCeQNKgAjx5/vFYbvL/nsYfunuctv7Rf9RBAKsj5Ew9sEgEJH7AlBmRYhQUueGZGkmAQxf3XcH7Xa7X7pWfk3fbt7o/+GEAMhkmpHOoqKhxj4ggtmgnlGbAsyhjrFcE8grfdsP3W367wYs5Td8c9/1X0JhpiBT2atiCdB9IgdmGgLIbC5JHlsGw+Mv2O0Ouui/mxoW760e/O4/80tPcNICIhlbjnukhFgCuaZBUgJE9lYomjxcAyS/arPph+52/bf+glNKMh/JbBYQMeYkoEVLDh1yEhGVkuw3YJhx9Y4CJO95bbs9qF/t/vbPXFGToL5YHQsomSmzGYAQjoMG805uNkAIZjNmSKYuM28BmPy+ftkPf9J/Dyftbc8j7fsPpREgQuQpbaQEOGbA0HJBOjMvaBBDIHJoQhDqhKN/vr1Ov7r4g7CoCGURYgJhYGpAJhox3DomRA6tCNlIrm1S+MDbzCY/uD/ZXWfX3/gdjygEB+oKggoggIzPYsA1mgjB+BE4UaBogOlHneZEyp/fXfZvz0/53kCGH9wQQO7dQYaitBhu8+L65Z8CKjpjg+OCBp69bWIwTRBEIGbOv67vvh12b/TXf9+C6vrZwvx475jjV0pCDNaTeDi86yOHKmIVgYTbKTaPFgRtkQ2IIFCFp44eLw3CF/umf7teXfW/KuU+CASxBBbPEsZCoVCOOCtRaEahMS8GQ6NGjhBFIAZlvTTj/T+eAeS398tvn7676L97kaETwdoAASYI90+VAwVOQqNFCQDLSRWlFSgnS9aLj/1kn1/xoV/ddwdst4f0ftl/E5WTY5wUokA0LZqEyLuObYyaiAEMShSmBtEyRFMxksx3P3N8b+Ajv2XXD97sDtk+efOnUFtjPkoAKUkKiGc1ChVTmS0BOJGpQtgaEcxX5ENf2+zbbv7nF/bd9oC+vbr8KQBlBtkfE8hR9mbM1LFgARLJJYDJsGiBSDtf3KjJL+pXey76X6l3//hrl5sD+m7bf7TVnFhaGWOSETnDsiYmhjHH0YhkOFBLu40oQTkJNTm+y6tFvu8b27nd5uIH8Rw/5Wqz2W42F1eTvumfQwlAWLVySlqC2QCxIbUxK/PKVPYre+sxaP2SvpvsLvp/P5b0va/3+V3vvW+//gOZgLz7HuH9M0PQGG96VGnUknNTAzgeabTEPeBclHJTees39v1/m6ry0qd+7n/6Yx/+p/t213vfvP4DyRnK2eIOmcGsZMvMdSizTqwRwbO3OF6+ZWU9IASlDqv3tPSv9qve+277DZ/6L59RMPmRzzHQftJX9V3vm297z5xk5v30zrEz07o8euAwkVInrQIBcveE5JoCVIKf8WSz670/6X+CD0KmoiyT/9w3vW8vfxJlRtrAwEffRFBRHq3BBCGYGpCerUmGyoHK7NkdHvN9v/Vy23vfbr7y477/kSK5jiADHn3GZNN/H3UCpVCYl2lZg8ymzCHaqliS9Z09+4fVuHzXN202vfd+1b/gpUcDENUmAQ/4AZfbXe9X/R/QYkYRSgDEZL04H0GBtgckgppLjleUcU9UECCTX9Gf9N77rn/Kj3kJI3BArPX0Q/lBr29m/jlVIIkAUFABk5PKde8MGhTHx7x4CwlnFicIQVvY/tjuctK/9n0LCsslBSG48S5z+JR+NfmHVGbGQeZbYWphb4hOfkdFhGRWQIkEEKHw3/qm990b/a/z+CWwBPNJG/mR37btfdP/GiGweArCYFVRYpKeNJzUJJg+apVCTZJnTxbv4MGAalQlglfey0d+8673be/f9FLcPJVa/cU3ECCjVP5G3/Sr/hs5dgGLVQkwizAWppYhQAJLEJMPKqgC6xvr41fu3qpMQxOxPnv3bU82fXf1jb//EdQlAg+TqchT9x/2bd/0v1OHPGJ6a0XkeUI6Ez4+IRSkJtNPfnwDkTg5/9i3uDgLgRtHkQYax++88+M3V7vtmx8C5r2H1XEkQKZy7/zsf/TNpv/fc0Igli88Kul5E8UJ9xckAZbQCW+7ZxCM7+JHPs+CmkQ8OncQQu6eHX1R75f911KlDAysl4xhCDK9+RP6k23/4mcpKXh70QpJSBQnIAJqC2NyAiJEqyCDEgvQhVkYBn7v1Wa7+4azCIQgsFBaRIRKC/5y3/Sr/ichZThzVYBMWuYRs+cDctxI9qYya2TBzAIhWACi5D/rV5f9zw21JNcVra2Nf6lf9d3F9hc1KFFAZmWvAFY5cGhMzUopkGMFyBoIpB//NdvdVf8nAGVYnQxnp/dfevjqy4+eO0Wm7Wv7dNf/zkeKTMMxycgFQjImmhx6sgAkEgziwQKVOgABhV/en/Te+8/+rb/vD/+df/BP//Xf/3f/9v9+86d8yzd+ypf8u7/2N//yX/rNv+k3/Nari4uLi83mor/5138coLHiwZoW6wdtiKFy1MrAWsC5eYmBSGIoguyVj/yCq4vN1dVVP/iLdq+/2V/r19/13n9GlEoWSgBRhmgDQoHgUJ1AMyy3x3evQPbK8mf849cvet9tvuWr/s/v+C0/9z0f8fxbH989vnXr9p17d89v3Dx7cP+ZFz/sg977cT/q7/3bf/N5f/+v/5r3r1gMuQYQGoiOPH4PCboHnAFM6jNL0H0R+Ak//hf+0p/70z/o0YLv6PZ2ptkkWoLamLaRk6cJkL2lTGQoZCKz7mnUYL/W0RbOIxmGphGCoMLQhJMBDBEwkL3GzLIxzRMBSkMMJCTDI9/5I5c/9dXlDz4KQACZtxBiGMDwgAzmAwSTaSwLH3pGzoUzKqDCamGYBaiRxwUwH3zojfXJ2c2byTUjMAUjG+NIDICTWgkCIDn7YN5z79YPul/PhQCZb0WZlWi1phkt6wgCDAWWyyUHlgpoSVCALArIbCgYUQhICdrxjeOViMHeTNCZFlhLDtmojWkUs/BgQS0xZxkBaosUFeoiAmIughDJZr77VggUjgoZUdQ9UxGgRUALZH8IBBZSBAnAW7UUErCQkIFZIpiVWeOlM2QQM82R0hKdqY1DjSIBlJxIjNwchnCUvVGgiTIVmZYbMSyACBCQ0x9yRkAgt5dgNUeZ0wMUJZgKhKgtjpKAchRAcv2cEMiE1YqY5DqZl2nIt2MQKZY4BIwWzMryQUKUiAMUUCeATFdro3DNVWNewBkRMDMhF8FszOWIpMg0BzEPIAAK+0IEYjiaOBGJZ88PmhUnNA2UwwWRecnKt6N1HwmiZMrBxycRc9+jA1ZQOCBSDwAAsDQAnQEqdABNAD5VIIxFI6IhHG3txDgFRLGAavkJnc/4DzMa326Qr9gD1L7Z7zJ+bX6M95r9ADpYP8Z/wPSZwODdh9z/InzZ8IPrvxy9pHD/1iamXa3/L8ru835BagXrPzOfluwr1D/GegR7YfWP+L/cvFb/1fQP8r/wfsAfqZ57f5DwFPqH+Q/ab4AP5j/Wf+f/eP8L8KP87/6f8x/qP3Q9k36L/i//H/qPgC/mX9Y/63+C9qv/2+2T9qP/x7lf6yf8n8/1P994qjsRehraF2Mc1SuewkSoa32uO1v4brbTmELzUeldxhAmPvXcXb+DPOSeNy78Wmtz9xTRpDH/T5v3v2tTjuFGxn7u5Iu9Z7hFwwvMo3fkS7WeE1dKPO9Q8tTuZM3OrnkYD8r6Jw4Ixg56vOi5sO2V1jUVTSATYhouq/Nhhs9exJS6E02qWytYMcbf9x85BThE2wbpdjsxTStZPz75qiLrRjUeFrgs8QyQeGhnzx0uh5Tkd8P7XTZ/unti7YH49gUS7a8lxPE1cTqcupcU8YCfPx1lPlymshbc2ISfUKKlcfcTo159AAD+/qkJed/0+JrE4urrC5otg8imr1w1zP3I9n464ga58XWYYcTFU8tDtY3oll4V/Bj6Rc+KaHt/9k8ClHlEyCe4UX+c/V5C7Cs/NVFlO5ewBknojmmEJof5zN5E9WwlEo8/FJj03F2AmOZFkJ00njjb/5LEyEutSZYOEX+i6BRzbsnKP+GR/fmFJDJwmA69k5jtuCMxh2LQNEbf30jiW10o9QFYdU27iIFVXsmYyiXjSuRO81aVYDhFikufsMbVgkW3ppJ1GM2zpeMc6Z9dUPmVH7C1fGx/nS89pa0832ijqV0k8mjFSpR6klN4vtJaubrsnVG8scbLHqsX45f6mfIHiKbykpxQ54M8QGnFKHZORV5/QAfHNTaIsDA7aLm6jicB+hCIW1aFJyC1cwvK8PH6WnFeO1QHSIBP7rSJ/5RyQs5yArmsCNloFy4E+gN94GN2h1j4qNjQ61i2s4QC0Dnawf53pCMEvusUsYmIwl4qsbTSgMNb3Ya5JObCUli+e7eBkSMGGR2dc4Nkc6hls2OC9Z4lnyAudg78bQWRAJd2NCcuxCHhfIgWSrUAW2L9bxrYMfX9KE4oR/n4a4bUxxpqJvmIWNElJHAOOVdQrGyTEHCltEN9XJjG5mVJI3oGiUyKh1FdrM74iMCMDmMOFFWXoLEopiOWYhMGZ+UsBaDv1jzKelPSQWGfpygbqtmSZFLLfdF8YLnWd+Fij70a0Stv/kDsRgrQEIOSWjXa0CqL33oWNPO15A2qEg6Eew9nUkCC2j77kADd7jdYEKSMA2a4ly0nvCsMcLyukZQ0XDS45IQXqrkqZXWqVtafhPyNip5esyq1c6G2QVFuND9cQuPMjNlfXRLH2l8//8DamyqjMsfrKrk6nkMTv+f/GD/E75O3D/mZe/3fb36DYUAvv1Z4aOcfJdHS+YbFBWLF+hpxfn4sfgi6uFnV8nxUr1+46C4rE8TSLBfj2M79KqMK7I4Mppe6MMKi3d/kTHzcjmt32MKC9MzV0flB7A+2+l69InnPxqCw+IcYdt0hpMOvO5RKSy6O8ZIQ+SGwLm4Za2l7pWwTDRVdvRQW622x5DMbRXuxSaa6402PyGIvNPtD/TB+DcUinSNpACo5xZ3O3CrB+rtru6YfOhSRmMj+w/3ox7imQj4f6yY6rL9u2gMUt/roVuxqWW6Rz8BFC67yCOy1aXk5tHEdAYMINT+qBCe0l/ui1HCA5yadpH5a+rZMGiwRQUJpgOZiXhjwqpKjELjoLubNU7hABR4MuyBg2XkOQWOSMV2O4rV1/DBRKXc9IuzKorVXIL37zLmJ857/NSs9OKPox69ElF0D/fLF+YVqVAZh8X3lGCkTZtSKjl98Iso0bqBqsNT3SQZB/qjEmh68MX6MpGpx2vTo6mCGZNibcsOPIhrwPQBwyyEitmWr3FeYYgveBWndwgYstE6vehHWHXm7th15fIOWtUZeniUEh7SR/gtiKAdgI6WY5jMvilXiw/eWeVOOTKhkOm42/heDxQVWK9xwUnbiq8JT0GKlkf1B0gnTVCQn0zOT2O523fzyyWZQW0ZQKBcZ2SJizAiEHX1vPWghiOWqxz4/YptD8hVyXY9nAueWd8jQP51fZU/NQ7df/9JYGIPhboZ9xvbf/phwI8cxenUk6fVqFvm/OZNHchmLyL1ah27duSA+bS8mtWsR67oTdzUCefJp+h1JgYzyttluOLAn7U2MD8WLZsuqzgTYJUX9XRiPNUARTbxBHSWJEZYiGRqyRzWWhaqsEjQAKMifp6JepDMfprk/uVsbrF68xjfa+PY4AImnhr1/CI5WRp69RV7VuaWzROhrwHMDQqfzWWvqT+MDReFzkCAai/KeHji09lEXckrv2qUl4VEcGEiQbenr2J4b4LczRotSiC1wW0/IEtrmqwXA0I/drOG9ggOamHINMVAVDcEuL6ElGujEGxgXU7msv6r/bFtdxwkV5Pu14yD72l2VDPB2lDSDScOOXcKDQzlvep+BFCA5adk19m5Jk7tv+Wzt0p3qKMKhpU9BMotLO+YBlFYP9MHX8gGDspV4qU7cjo09oBUAnpO3nb0RFQYfp3M29nirK37bPmPeHyTJ5yrivCcGwo1DDh7yRb6TKUfcK9S2BEhbpHsCxYlXvXk2MuzjK/8Hkcq5bybD9CT+m0ncXwdYb5YytjV21o8Zzq9NP556Yi8Wh+0LpdJoPnixGI9Be22n2m77y0K2jotNP8rZNtsbL+WOca7GhW8+KIJFlc5biIl3t6gNAUgbZlz8/b+IeJzuwYINvCRyIoXKrjBsE/MqEDCEcmBKqo7AI+YISLtKSbJZ+25LTdfK/2jZaCLXW6gOoav02H9uFg/Dvpnfgl6UPQqiWg3AtR8eg6SHn0jODNYIbZX/RM/ySenvs6Y6PXKDJNTe8Tyb5XlxmzGEv73KyO+dwoYO+s1QDUar73VG9Mj092vVwBdV+S5jHN1GjRRUb0PuxdUsom1sBQb6dLa23I/401cd+dS/GAPbbHQbBtd8hZDmq+IVBncDVnzp7eWDXTtV9Q9LHxy1UcIBAx+R9poozinoX48QQIjGR+SyUOuY5UFrc1mdyMoAJ9BLaJFEsc8q+dey9AAp5R0hTrR7JhwraoJ5PIhwihLp4yZBqzEirLcRP3U6aGJIbDUxS6XrGR6qt2tSgGfBKZ1UJ5vuk/we3phauVk7etHsZ9CxFQMgG3BGfm39aUV719HXcZ4L5J+BqHdctiIxlvMkY1c/nPgR55PgMCP0yk8gZKD6WEUJKMIIOdxm3l+ztV9XQ6DM1KhSHZDicSob87J99HhciViNdyP8cras9bQGtiACWKJEaL+nMkNDzmCNiQG3wgQb3ZKnqJRjVjeaR1WM7x3uTcnhE3F8koj8UHDaz+atBCEczdR3ou/8g/kQ2xzxWLqqyXJnGgm3aDcP4mSv3ud7cwfhUCtimQuIq4mmTaHabzDeKBu8WHsX5FNmadFUaGseWxtoxTAloBjiAiItZgY2D4WMJzXaZZVPNcsUvrvljxfz7LH3COIe6c8wrvkHC2GZJejqR6jnCWqXAummyP5jPTn0bKZBqfP7YscDc0qSKZnPSDJdVGWmnUBNJQgWrfcEYF2rrQu0+p1hm2+gKkudes8PeazPIeVtoFt42NvzgZiBMwvigWbQvU84ng1nxZ2nMyhabYnonajZAdwc2RthGfIi7AHk4VCIioVsYimasxd6IfqGfmvzjx7UE8Lvt8w2mSPqAC+4zf4hogsa5pZ17qum6fEYjSbYVQmnWb/+6pgyR3zydRJcd0bNdqedqrVnWo9DXeNzXD3JsXJLjikYCU0I8sEPcfT6OyLPPofJBUXkI+RP+YgqikBecVq85+TIFReOPM7rzdpZQRxVIi/Wt8NpL3eRNYeBxwmWaQcbFAEDkdZNVdNi4QarzvYXGK5afuKOYuUFBcc66HZQeNeHD7sbkacjYooLMZFRh4BpL/mNkpWYJJjSfU+/2WHbUNHMrLbtqRR87DcDzKOQ/AOvC+WAfSNy61/B7L71vsX6fhZ50mFJJkwKAcHM4Yt2co+BujXdwolYiW06banXgoAokgOom6/NvjEHmiXLOoiZxC+0xOwfO5MDzta/WupaGKVP92+1iqBHo0rTpSslQd6hKeQ4OQlttIkXPyCMhONuubwED7Az4Mj+C4dgWW0aJUdnbBhb50Ti1EeTTI6GvIP+/uY/FwYE6552HVHCS8M+FZQAIpkqsp+y8DU27ZzAsrQdSRizsRWQkerpCuWKT8YVFqMG0v0UigBbX0kYQvoypNZBSlPg0drftmhbAn4rklroiHri+z62OKJIJ0TjrMU+OtmGDKRxFFol+bG10FjAUlyxr0DDDQw7lO3/Qrj5/Zqf+0C0F7SuYVYfTh/cqlQqP3Mw+8NtlhYj577BtWQesv7oU2ZBCL0czZLnO5cj7HF7V660K/5eg5+NXJDoiVEO3pCy5XsunZReBNWm+kJZEijzCo6yKYs1Ss67v7CFM4JMfjzA7IJG7P/B6hvtmXKhGTPRfqcY/sto3XbAYqc/Ktbz1iL2eXv7VbuzABeO2XZdMKqLTzsNTitnuJxTPh98+Ctp/d7gMi1MqOWZOjfKyK7QHD5OaOxfGbsqpnW8IDQWA0Oi7LKcwNEYnl46FbQs2NCt0S5Luh88KiN+b2SV+gCGnNc8b52DdKPzsLX40BPeQnxTdVSPLdSSM3gLNGnD60/rQdKUkYMIUW+X037oHXd/z1BMRpacd01YBX3RpSfCxCMA3Ep00kwocMgKhvBEY6+Xc2zYcD39f9MBxoeN9I5M8tf5wDRAVVcOJdsm4X9noKuJduHEA/kKWEzYO8hVX9TZ5VCkd85tNpeLXI8ROZqt30DmukBAjPf/UIdQF/8Y4n5+52uwy99fpcF1ON9FS0HH8rXmZLt45rXzXntin3G31ZfCIrAC+TkS2Gl/l7DD/jywUdTvF8tCOs2ZAl4aZW6/C8c56ewNwuWqfSCPHNcxvv/Erf4z0GmCjldRw+9rfPdyXqbhydxq/RdsCjHnov1BVBZ6v7yutJ9jqC4kMU4QxQjYMsY8fa+zQv2a3UxZvlPE7s/Zsq3dLhdmgUh4DeVm/piagyQSoKeUP5xZb5FxX7GZ4nZ59OuWAikqAAAAAA==",
  "marcus_hit": "data:image/webp;base64,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",
  "marcus_pinned": "data:image/webp;base64,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",
  "marcus_backTaken": "data:image/webp;base64,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",
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
      guardTop: "marcus_guardTop", guardBtm: "marcus_guardBtm",
      spiderGuard: "marcus_guardBtm",
      mountTop: "marcus_mountTop", mountBtm: "marcus_mountBtm",
      pressTop: "marcus_pressTop", pinned: "marcus_pinned",
      backTop: "marcus_backTop", backTaken: "marcus_backTaken",
    },
    yuki: {
      idle: "yuki_idle", idle2: "yuki_idle",
      win: "yuki_idle", lose: "yuki_tapOut",
      hit: "yuki_tapOut", tired: "yuki_tired",
      effort: "yuki_effort", tapOut: "yuki_tapOut",
      guardTop: "yuki_idle", guardBtm: "yuki_triangle",
      spiderGuard: "yuki_triangle",
      mountTop: "yuki_idle", mountBtm: "yuki_mountBtm",
      pressTop: "yuki_idle", pinned: "yuki_mountBtm",
      backTop: "yuki_idle", backTaken: "yuki_mountBtm",
    },
  };
  const map = FB[lookupId];
  if (map && map[pose]) return SPRITE_DATA[map[pose]];
  // Last resort: idle
  return SPRITE_DATA[lookupId + "_idle"] || null;
}


/* ═══════════════════════════════════════════════════════════════
   MULTI-POSE FIGHTER SPRITE + RESOLVER
   ═══════════════════════════════════════════════════════════════ */

function resolveSprite(char, {position, isOnTop, stamina, isMinigame, animState}) {
  if (animState === "win") return "win";
  if (animState === "hit") return "hit";
  if (stamina < 25 && animState !== "win") return "tired";
  if (isMinigame) return "effort";
  if (isNeutralPos(position)) return "idle";
  if (isOnTop) {
    if (position===POS.MOUNT) return "mountTop";
    if (position===POS.BACK_CONTROL) return "backTop";
    if (position===POS.GUARD||position===POS.HALF_GUARD||position===POS.OPEN_GUARD||position===POS.BUTTERFLY_GUARD) return "guardTop";
    if (position===POS.TURTLE) return "pressTop"; // attacking turtle ≈ pressing from top
    return "pressTop"; // Side control
  }
  // Bottom positions
  if (position===POS.GUARD||position===POS.BUTTERFLY_GUARD) return char.id==="yuki"?"spiderGuard":"guardBtm";
  if (position===POS.OPEN_GUARD) return "guardBtm";
  if (position===POS.HALF_GUARD) return "pinned";
  if (position===POS.TURTLE) return "pinned"; // turtled up ≈ curled/pinned
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
    const standingPoses = ["idle","idle2","win","hit","lose","tired","effort"];
    const groundPoses = ["guardTop","guardBtm","mountTop","mountBtm","pressTop","pinned","backTop","backTaken","spiderGuard","tapOut"];
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
      victory: {out:"trans-out-snap", in:"trans-in-victory", dur:600},
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
          animationDuration:(0.4+Math.random()*0.4)+"s",
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
      letterSpacing:"0.1em",whiteSpace:"nowrap",pointerEvents:"none",
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
      ...(r.eggStats||{}), ...(r.stats||{}),
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
        [POS.BACK_CONTROL]:POS.SIDE_CONTROL, [POS.HALF_GUARD]:POS.OPEN_GUARD,
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
                    transform:`translate(-50%,-50%) rotate(${pRot}deg)`,
                  }}>
                    <Fighter char={playerChar} size={pSz} facing="right" isAttacking={pAttacking}
                      pose={pAnim!=="idle"?pAnim:resolveSprite(playerChar,{position:pos,isOnTop:pOnTop,stamina:pStam,isMinigame:phase==="player_minigame"||phase==="defense_minigame",animState:pAnim})}/>
                  </div>

                  {/* AI fighter — position-aware */}
                  <div className="absolute transition-all duration-700 ease-out" style={{
                    left:`${aX}%`, top:`${aY}%`, zIndex:aZ,
                    transform:`translate(-50%,-50%) rotate(${aRot}deg)`,
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
