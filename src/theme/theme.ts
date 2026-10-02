// ワイワイ！ theme — risograph paper (2026-10-02; replaces the lager glass, then the cream soda).
// The app reads as a two-ink riso print: pink paper ground, big speech bubbles in riso blue and
// sunshine yellow drifting slowly behind everything (src/components/Screen.tsx → ChatterGround),
// deep navy ink type, and white cards with a misregistered yellow offset.
export const colors = {
  bg: '#FFE3E8',        // pink riso paper (base ground)
  bgElevated: '#FFF6F8', // opaque light-paper surface (modals, inputs, chips, banner bar)
  card: '#FFFFFF',       // white card on the paper
  cardRaised: '#FFFFFF', // playing-card face
  cardBack: '#2E5BD8',   // playing-card back (riso blue)

  blue: '#2E5BD8',      // riso ink 1 — speech bubbles, logo
  yellow: '#FFD23F',    // riso ink 2 — speech bubbles, misregistered offsets

  primary: '#F0436A',   // fluorescent riso pink — primary buttons
  primaryDark: '#C92D52',
  accent: '#2E5BD8',    // riso blue — labels, pills, accent buttons on the paper
  accentBright: '#FFD23F', // yellow — only on dark/blue surfaces (card-back crown, trophy)

  text: '#18203D',      // navy ink (primary type)
  textDim: '#4B5275',   // dim ink
  cream: '#FFFFFF',     // light foreground on colored buttons

  danger: '#E0314F',    // loser / hearts red
  success: '#1F8A5B',   // confirmations
  overlay: 'rgba(24,32,61,0.5)',
  line: 'rgba(24,32,61,0.14)',          // ink hairline on panels / cards
  accentLine: 'rgba(46,91,216,0.45)',   // blue pill / badge outline
  glowRed: 'rgba(240,67,106,0.10)',     // retained token (unused)
  glowGold: 'rgba(255,210,63,0.16)',
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
