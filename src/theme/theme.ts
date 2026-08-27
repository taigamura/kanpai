// カンパイ！ theme — warm twilight-blue izakaya palette (locked 2026-08-26).
// Mirror of docs/design-mockups.html; keep the two in sync.
export const colors = {
  bg: '#233A63',        // warm twilight blue (ground)
  bgElevated: '#2B4675',
  card: '#334F82',      // surface
  cardRaised: '#3E5C94',
  primary: '#FF5D66',   // 提灯 lantern red — warm pop on blue
  primaryDark: '#E24651',
  accent: '#F7C64E',    // beer gold
  text: '#FCF5EA',      // foam cream
  textDim: '#AEBFDC',   // soft blue-grey
  danger: '#FF7078',
  success: '#4BD6A0',
  overlay: 'rgba(0,0,0,0.55)',
  line: 'rgba(252,245,234,0.13)',       // hairline border on surfaces
  accentLine: 'rgba(247,198,78,0.4)',   // gold pill outline
  glowRed: 'rgba(255,93,102,0.18)',     // top-left lantern glow
  glowGold: 'rgba(247,198,78,0.14)',    // top-right beer glow
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
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

export const font = {
  title: 34,
  heading: 24,
  body: 17,
  small: 14,
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
