// カンパイ！ theme — 生ビール Lager beer-glass palette (locked 2026-08-28).
// The whole app reads as the inside of a lager glass: cream foam head across the top,
// amber liquid ground, rising carbonation, dark roasted-malt ink type.
// Mirror of docs/lager-tilt.html + docs/beer-glass-ui.html concept 1 (c1); keep in sync.
export const colors = {
  bg: '#E39A24',        // amber liquid (base ground)
  bgElevated: '#FBF3E0', // opaque warm-cream surface (modals, inputs, chips)
  card: 'rgba(255,255,255,0.17)', // frosted-glass panel floating on the beer
  cardRaised: '#FDF7E6', // playing-card face (foam white)
  cardBack: '#4A2A0A',   // playing-card back (dark roasted malt)

  beerTop: '#F4C64F',   // liquid gradient — top
  beerBot: '#E39A24',   // liquid gradient — bottom
  foam: '#FDF7E6',      // foam head cream

  primary: '#FF5D66',   // カンパイ！ red — the ！ and primary buttons
  primaryDark: '#E24651',
  accent: '#A85A0C',    // deep caramel malt — labels, pills, accent buttons on the light ground
  accentBright: '#F7C64E', // bright beer gold — only on dark surfaces (card-back crown)

  text: '#3C1F05',      // roasted-malt ink (primary type)
  textDim: '#5F3E17',   // dim ink
  cream: '#FCF5EA',     // light foreground on colored buttons (red / caramel)

  danger: '#E23B44',    // loser / hearts red (deepened for the light ground)
  success: '#12805A',   // confirmations (deepened for the light ground)
  overlay: 'rgba(0,0,0,0.5)',
  line: 'rgba(60,31,5,0.16)',           // ink hairline on panels / cards
  accentLine: 'rgba(168,90,12,0.45)',   // caramel pill / badge outline
  glowRed: 'rgba(255,93,102,0.10)',     // retained token (unused by the beer-glass ground)
  glowGold: 'rgba(247,198,78,0.16)',
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
