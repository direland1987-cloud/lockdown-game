# LOCKDOWN — Full Game Audit Report

**Date:** 2026-03-15
**Tests run:** 68 checks

## Summary

| Status | Count |
|--------|-------|
| PASS | 62 |
| FAIL | 6 |
| WARN | 0 |

## Failures

- **arcade_select:** SELECT button not found
- **sidescroller_Run to the Gym:** JS errors: Cannot access 'S' before initialization.
- **sidescroller_Parking Lot Escape:** JS errors: Cannot access 'S' before initialization.
- **sidescroller_Mat Dash:** JS errors: Cannot access 'S' before initialization.
- **sidescroller_Belt Promotion Run:** JS errors: Cannot access 'S' before initialization.
- **sidescroller_Post-Training Limp:** JS errors: Cannot access 'S' before initialization.

## All Results

| Screen | Status | Detail |
|--------|--------|--------|
| splash | PASS | TAP TO FIGHT text visible |
| splash→title | PASS | Title screen loaded after splash dismiss |
| splash | PASS | No JS errors on splash→title transition |
| title | PASS | Menu item "Campaign" visible |
| title | PASS | Menu item "Arcade" visible |
| title | PASS | Menu item "Training" visible |
| title | PASS | Menu item "Mini-Games" visible |
| title | PASS | Menu item "Moves" visible |
| title | PASS | Menu item "Skills" visible |
| title | PASS | Menu item "Daily" visible |
| title | PASS | No JS errors on title screen |
| arcade_select | PASS | Character select screen loaded |
| arcade_select | PASS | Character "Marcus" visible |
| arcade_select | PASS | Character "Adele" visible |
| arcade_select | PASS | Character "Yuki" visible |
| arcade_select | PASS | Locked char "Darius" shown |
| arcade_select | PASS | Locked char "Diego" shown |
| arcade_select | PASS | Locked char "Rusty" shown |
| arcade_select | PASS | Locked char "Luta" shown |
| arcade_select | PASS | Locked char "Mahmedov" shown |
| arcade_select | FAIL | SELECT button not found |
| difficulty | PASS | 3 difficulty options found |
| arcade_fight | PASS | Fight started successfully |
| arcade | PASS | No JS errors in arcade flow |
| campaign_charselect | PASS | Campaign char select loaded |
| campaign_charselect | PASS | Marcus clicked |
| campaign_story | PASS | Story completed, reached map/next screen |
| campaign_map | PASS | Campaign map visible |
| campaign | PASS | No JS errors in campaign flow |
| training | PASS | Training char select loaded |
| training | PASS | No JS errors |
| mini_games | PASS | Mini-Games screen loaded |
| minigame_Catch the Mouthguard | PASS | Mini-game loaded without errors |
| minigame_Clean the Mats | PASS | Mini-game loaded without errors |
| minigame_Belt Whipping Gauntlet | PASS | Mini-game loaded without errors |
| minigame_Wash Your Gi | PASS | Mini-game loaded without errors |
| minigame_Don't Get Stacked | PASS | Mini-game loaded without errors |
| minigame_Tape Your Fingers | PASS | Mini-game loaded without errors |
| sidescroller_Run to the Gym | FAIL | JS errors: Cannot access 'S' before initialization. |
| sidescroller_Parking Lot Escape | FAIL | JS errors: Cannot access 'S' before initialization. |
| sidescroller_Mat Dash | FAIL | JS errors: Cannot access 'S' before initialization. |
| sidescroller_Belt Promotion Run | FAIL | JS errors: Cannot access 'S' before initialization. |
| sidescroller_Post-Training Limp | FAIL | JS errors: Cannot access 'S' before initialization. |
| loadout | PASS | Loadout screen loaded |
| loadout | PASS | Position tab "Standing" clickable |
| loadout | PASS | Position tab "Clinch" clickable |
| loadout | PASS | Position tab "Open Guard" clickable |
| loadout | PASS | Position tab "Closed Guard" clickable |
| loadout | PASS | Position tab "Half Guard" clickable |
| loadout | PASS | Position tab "Mount" clickable |
| loadout | PASS | Position tab "Back Control" clickable |
| loadout | PASS | No JS errors on loadout screen |
| skills | PASS | Skills screen loaded |
| skills | PASS | No JS errors on skills screen |
| fight | PASS | No JS errors during fight gameplay |
| mobile_title | PASS | Title screen loads on mobile |
| mobile_scroll | PASS | No horizontal scroll |
| mobile | PASS | No JS errors on mobile viewport |
| nav_Skills | PASS | Skills screen loaded |
| nav_Skills_back | PASS | Back to title works |
| nav_Moves | PASS | Moves screen loaded |
| nav_Moves_back | PASS | Back to title works |
| nav_Mini-Games | PASS | Mini-Games screen loaded |
| nav_Mini-Games_back | PASS | Back to title works |
| nav_Arcade | PASS | Arcade screen loaded |
| nav_Arcade_back | PASS | Back to title works |
| nav_Training | PASS | Training screen loaded |
| nav_Training_back | PASS | Back to title works |
