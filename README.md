# カンパイ！

飲み会・宅飲みパーティーゲーム集 — an offline, single-phone (pass-around) Japanese
drinking-game bundle. 100% on-device. No backend. No per-user cost.

See **[SPEC.md](./SPEC.md)** for the full product spec and the reasoning behind every
decision, and **[docs/ROADMAP.md](./docs/ROADMAP.md)** for the build order.

**Starting a fresh session?** Run **`/catchup`** — it reads those two files and restores
full project context (they are the source of truth, not chat history).

## Stack

- Expo (React Native) + TypeScript — reuses the existing EAS / ship-ios pipeline.
- No server. AsyncStorage for roster, custom 罰ゲーム, settings, ads entitlement.
- Ads: AdMob (added in the ads task). IAP: ¥370 remove-ads 買い切り.

## Run

```bash
npm install
npm start        # Expo dev server
npm run ios      # iOS simulator
npm run typecheck
npm test
```

## v1 games (anchor: 山手線ゲーム)

山手線ゲーム · ロシアンルーレット · 高低（ハイ&ロー） · チンチロ · キングスカップ · 匿名アンケート

## Project layout

```
App.tsx                 providers + minimal router
src/
  state/                AppState (roster, custom 罰ゲーム, ads), storage wrapper
  navigation/           tiny on-device navigator (no react-navigation in v1)
  data/                 game registry + content (themes, questions, penalties)
  screens/              AgeGate, Home, Roster, Settings
  games/                the 6 game screens + shared PenaltyReveal
  components/           ui primitives + GameFrame
  theme/                palette / spacing / type
```

## Safeguards (non-negotiable)

Drinking is never forced — every penalty offers 飲む **or** 罰ゲーム. No 一気飲み mechanics.
Age gate + EULA on first launch. Responsible-drinking notice on every game screen.

## Status

Scaffold + logic layer in place. Cheap games playable (山手線・ロシアンルーレット・高低・
チンチロ・キングスカップ); 匿名アンケート is a wired stub pending the secret pass-around
voting flow. **Design mockups come next — visual direction is not yet finalized.**
