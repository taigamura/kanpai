// カンパイ！ theme — メロンクリームソーダ palette (2026-10-02, replaces the 2026-08-28 lager glass).
// The whole app reads as the inside of a melon cream-soda glass: a vanilla ice-cream layer across
// the top, fizzy melon-green soda below, rising carbonation, deep bottle-green ink type, and a
// cherry-red accent. Non-alcoholic by design (App Review 4.3(b) reframe — see docs/STATE.md).
// Token names (beerTop/beerBot/foam) are kept so call sites don't churn: "foam" is the ice cream.
export const colors = {
  bg: '#3DBE6C',        // melon soda (base ground)
  bgElevated: '#FFFAEE', // opaque vanilla surface (modals, inputs, chips)
  card: 'rgba(255,255,255,0.20)', // frosted-glass panel floating on the soda
  cardRaised: '#FFFDF6', // playing-card face (vanilla white)
  cardBack: '#0E4D2C',   // playing-card back (deep bottle green)

  beerTop: '#9BE78F',   // soda gradient — top (lighter, near the ice cream)
  beerBot: '#3DBE6C',   // soda gradient — bottom
  foam: '#FFF8E6',      // vanilla ice-cream layer

  primary: '#F2404F',   // チェリー red — the ！ and primary buttons
  primaryDark: '#C92A3A',
  accent: '#0F6A3A',    // deep bottle green — labels, pills, accent buttons on the light ground
  accentBright: '#A8EE8F', // bright melon — only on dark surfaces (card-back crown)

  text: '#0B3320',      // deep green ink (primary type)
  textDim: '#1F4D33',   // dim ink
  cream: '#FFFAEE',     // light foreground on colored buttons (red / green)

  danger: '#D7263D',    // loser / hearts red
  success: '#0B5E3A',   // confirmations
  overlay: 'rgba(0,0,0,0.5)',
  line: 'rgba(11,51,32,0.16)',          // ink hairline on panels / cards
  accentLine: 'rgba(15,106,58,0.45)',   // green pill / badge outline
  glowRed: 'rgba(242,64,79,0.10)',      // retained token (unused by the soda-glass ground)
  glowGold: 'rgba(168,238,143,0.16)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

// Type scale bumped up one notch across the board (2026-08-28) so game screens read big and
// bold from across a table — a party app, not a productivity app. Everything sizes off these
// tokens, so raising them here enlarges every screen uniformly without touching call sites.
export const font = {
  title: 42, // hero お題 / result numbers
  heading: 20, // section + game titles, modal heads
  body: 18, // default body copy, buttons, instructions
  small: 12, // captions, labels, vote counts
};

// Typefaces (loaded in App.tsx via @expo-google-fonts). Mirror of design-mockups.html:
// Dela Gothic One = festival-signage display; Zen Kaku Gothic New = clean gothic body.
// Values fall back to system fonts until useFonts resolves.
export const fonts = {
  display: 'DelaGothicOne_400Regular',
  body: 'ZenKakuGothicNew_400Regular',
  bodyMedium: 'ZenKakuGothicNew_500Medium',
  bodyBold: 'ZenKakuGothicNew_700Bold',
  bodyBlack: 'ZenKakuGothicNew_900Black',
};

// UI Studio (web + __DEV__ only): snapshot the pristine defaults so the Studio panel can show
// modified state / diffs, then apply any saved token overrides in place BEFORE the app's
// StyleSheet.create() calls read these objects. On native / production this is a no-op.
import { applyTokenOverrides } from './studio';

export const THEME_DEFAULTS = {
  colors: { ...colors },
  spacing: { ...spacing },
  radius: { ...radius },
  font: { ...font },
};

applyTokenOverrides(colors, spacing, radius, font);
