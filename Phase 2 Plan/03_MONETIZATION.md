# LOCKDOWN — Monetization

> Simplified model: rewarded video ads + two IAP items. iOS first.

---

## §1 — Revenue Model

**Primary:** Rewarded video ads at natural break points
**Secondary:** Two IAP items — Remove Ads ($4.99) and Skip Side-Scroller Token ($0.99)

No coins. No coin packs. No season pass. No cosmetic bundles. Keep it dead simple for v1.

---

## §2 — Rewarded Video Ads

### 2.1 Why Rewarded Video

Rewarded video is the highest-performing ad format for mobile games. Players voluntarily watch a 15–30 second video in exchange for in-game value. Industry data:

- US eCPM: ~$16–$20 (iOS tends higher than Android)
- Completion rates: 95%+ (because players opt in)
- Player preference: 4:1 over interstitials
- Retention impact: Positive — players who watch rewarded ads show 3.5x higher retention than those who don't

### 2.2 Ad Placement Map

Every ad is either player-initiated (rewarded) or at a natural break. Never during a fight. Never forced mid-gameplay.

| Placement | Format | Trigger | Reward |
|-----------|--------|---------|--------|
| Post-fight results | Rewarded video | "Watch to double XP" button | 2x XP for that fight |
| Pre-fight boost | Rewarded video | "Watch for stamina boost" button | +10 starting stamina |
| Mini-game retry | Rewarded video | "Watch for extra life" button | 1 extra life |
| Daily challenge bonus | Rewarded video | "Watch to double streak bonus" button | 2x streak XP |
| Between campaign chapters | Interstitial (skippable after 5s) | Auto-shows at chapter transition | Natural story break |

### 2.3 Ad Frequency Limits

- Max 1 interstitial per play session (or per 10 minutes, whichever is longer)
- Rewarded video: no cap (player-initiated, they choose when)
- Never show an ad within 30 seconds of another ad
- Never show an ad during a fight, minigame, or cutscene

### 2.4 Key Rule

**If a player buys "Remove Ads," ALL interstitials disappear permanently. Rewarded videos remain available (but optional) because the player gets value from them.** This is standard industry practice and players expect it.

---

## §3 — In-App Purchases

### 3.1 Remove Ads — $4.99

- One-time purchase, permanent
- Removes all interstitial ads
- Rewarded videos remain available (optional, player-initiated)
- Store listing: "Enjoy LOCKDOWN ad-free. Rewarded videos still available for optional bonuses."
- SKU: `com.lockdown.removeads`

### 3.2 Skip Side-Scroller Token — $0.99

- Consumable (one-time use, can buy multiple)
- Skips one side-scroller intermission in campaign mode
- Player still receives the side-scroller reward (they paid for convenience, not gameplay advantage)
- Store listing: "Skip a side-scroller sequence and jump straight to the next fight."
- SKU: `com.lockdown.skipscroller`

### 3.3 What We're NOT Doing

- No coin/currency system
- No cosmetic store (save for v2 if game gets traction)
- No season pass
- No loot boxes or gacha
- No pay-to-win (nothing purchasable affects fight outcomes)
- No subscriptions

This keeps the App Store review simple, avoids the complexity of a virtual currency economy, and focuses monetization on the two things players actually want: no ads and convenience.

---

## §4 — Revenue Projections (Conservative)

Assumptions: Niche BJJ game, moderate organic growth, iOS-first distribution, $16 blended eCPM, 2% IAP conversion, average IAP spend $4.

| Scenario | DAU | Ad Revenue/Month | IAP Revenue/Month | Total/Month |
|----------|-----|------------------|-------------------|-------------|
| Soft launch | 500 | $50–$150 | $25–$50 | $75–$200 |
| Early growth | 5,000 | $500–$1,500 | $250–$500 | $750–$2,000 |
| Established | 25,000 | $2,500–$7,500 | $1,250–$2,500 | $3,750–$10,000 |
| Breakout | 100,000 | $10,000–$30,000 | $5,000–$10,000 | $15,000–$40,000 |

The BJJ niche is small but extremely passionate. Players in this community tend to have higher-than-average engagement and willingness to spend on things they care about.

---

## §5 — iOS Ad SDK Implementation

### 5.1 Recommended SDK: Google AdMob

AdMob is the industry standard for iOS game monetization. It supports rewarded video, interstitials, and handles mediation (serving ads from multiple networks to maximize fill rate and eCPM).

### 5.2 Integration Path

Since LOCKDOWN is a web app (HTML/JS) wrapped in Capacitor for iOS:

1. **Use the Capacitor AdMob plugin:** `@capacitor-community/admob`
2. **Install:** `npm install @capacitor-community/admob`
3. **Configure in Capacitor config:** Add AdMob app ID
4. **JS bridge calls:**

```javascript
// Show rewarded video
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

await AdMob.initialize({ testingDevices: ['YOUR_DEVICE_ID'] });

// Prepare rewarded ad
await AdMob.prepareRewardVideoAd({
  adId: 'ca-app-pub-XXXXX/YYYYY',  // Your AdMob unit ID
});

// Show when player taps "Watch for 2x XP"
AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
  // Grant the reward (double XP, stamina boost, etc.)
  applyReward(reward);
});

await AdMob.showRewardVideoAd();
```

### 5.3 IAP Implementation

Use Capacitor's in-app purchase plugin: `@capacitor-community/in-app-purchases` or the native StoreKit 2 bridge.

```javascript
// Check if ads removed
const adsRemoved = await checkPurchase('com.lockdown.removeads');
if (adsRemoved) {
  // Don't show interstitials
  // Still offer rewarded videos
}
```

### 5.4 Testing

- Use AdMob test ad unit IDs during development
- Test on real device (ads don't work in simulator reliably)
- Test the "Remove Ads" purchase flow with sandbox StoreKit
- Verify rewarded video callback correctly grants rewards

---

## §6 — App Store Compliance

### 6.1 Apple Requirements for Ads

- Must declare ad tracking usage in App Tracking Transparency (ATT) prompt
- Show ATT prompt before first ad request
- Respect user's tracking preference
- Include privacy policy URL

### 6.2 Apple Requirements for IAP

- All digital purchases must go through Apple's IAP (no external payment links)
- Price tiers must use Apple's predefined price points ($0.99, $4.99, etc.)
- Restore purchases button must be accessible
- Consumables (skip token) don't need restore, but non-consumables (remove ads) do

### 6.3 Privacy Policy

Required for both ads and IAP. Must cover:
- What data is collected (AdMob collects device data for ad targeting)
- How data is used
- Third-party SDKs (Google AdMob)
- Contact information

---

*This doc is ready for Claude Code implementation once the Capacitor iOS wrapper is set up (see `04_IOS_BUILD_AND_DEPLOYMENT.md`).*
