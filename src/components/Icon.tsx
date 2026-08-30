/**
 * Semantic icon component (mirrors nibble-app/src/components/Icon.tsx).
 *
 * Call sites use APP-SEMANTIC names ('game-roulette', 'settings', 'die-3'),
 * never raw glyph names, so the icon vocabulary stays centralized and swappable
 * in one place. We deliberately use vector icons instead of emoji to match the
 * Apple design language (as done in nibble). Glyphs come from Ionicons where a
 * good match exists, MaterialCommunityIcons for the game-specific concepts.
 */
import * as React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName =
  // game identities (home tiles + rule modal)
  | 'game-yamanote'
  | 'game-roulette'
  | 'game-highlow'
  | 'game-chinchiro'
  | 'game-kingscup'
  | 'game-anketo'
  | 'game-katakana'
  | 'game-numberline'
  // UI chrome
  | 'settings'
  | 'info'
  | 'bulb'
  | 'back'
  | 'close'
  | 'add'
  | 'request'
  | 'send'
  | 'check'
  | 'players'
  | 'trophy'
  // in-game states / affordances
  | 'bomb'
  | 'fuse'
  | 'boom'
  | 'pass-phone'
  | 'beer'
  | 'crown'
  | 'timer'
  | 'up'
  | 'down'
  | 'star'
  | 'eye'
  | 'eye-off'
  // dice faces (チンチロ) — value-indexed
  | 'die-1'
  | 'die-2'
  | 'die-3'
  | 'die-4'
  | 'die-5'
  | 'die-6'
  | 'dice';

type Fam = 'ion' | 'mci';
type Glyph = { fam: Fam; name: string };

const GLYPHS: Record<IconName, Glyph> = {
  'game-yamanote': { fam: 'mci', name: 'train' },
  'game-roulette': { fam: 'mci', name: 'bomb' },
  'game-highlow': { fam: 'mci', name: 'cards-playing-outline' },
  'game-chinchiro': { fam: 'mci', name: 'dice-multiple' },
  'game-kingscup': { fam: 'mci', name: 'crown' },
  'game-anketo': { fam: 'mci', name: 'vote-outline' },
  'game-katakana': { fam: 'mci', name: 'comment-question-outline' },
  'game-numberline': { fam: 'mci', name: 'sort-numeric-ascending' },

  settings: { fam: 'ion', name: 'settings-outline' },
  info: { fam: 'ion', name: 'information-circle-outline' },
  bulb: { fam: 'ion', name: 'bulb-outline' },
  back: { fam: 'ion', name: 'chevron-back' },
  close: { fam: 'ion', name: 'close' },
  add: { fam: 'ion', name: 'add-circle-outline' },
  request: { fam: 'mci', name: 'gamepad-variant-outline' },
  send: { fam: 'ion', name: 'paper-plane' },
  check: { fam: 'ion', name: 'checkmark-circle' },
  players: { fam: 'mci', name: 'account-group' },
  trophy: { fam: 'mci', name: 'trophy-outline' },

  bomb: { fam: 'mci', name: 'bomb' },
  fuse: { fam: 'ion', name: 'flame' },
  boom: { fam: 'ion', name: 'flash' },
  'pass-phone': { fam: 'ion', name: 'phone-portrait-outline' },
  beer: { fam: 'mci', name: 'glass-mug-variant' },
  crown: { fam: 'mci', name: 'crown' },
  timer: { fam: 'ion', name: 'timer-outline' },
  up: { fam: 'ion', name: 'arrow-up' },
  down: { fam: 'ion', name: 'arrow-down' },
  star: { fam: 'mci', name: 'star' },
  eye: { fam: 'ion', name: 'eye-outline' },
  'eye-off': { fam: 'ion', name: 'eye-off-outline' },

  'die-1': { fam: 'mci', name: 'dice-1' },
  'die-2': { fam: 'mci', name: 'dice-2' },
  'die-3': { fam: 'mci', name: 'dice-3' },
  'die-4': { fam: 'mci', name: 'dice-4' },
  'die-5': { fam: 'mci', name: 'dice-5' },
  'die-6': { fam: 'mci', name: 'dice-6' },
  dice: { fam: 'mci', name: 'dice-multiple' },
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 24, color, style }: IconProps) {
  const g = GLYPHS[name];
  if (g.fam === 'ion') {
    return <Ionicons name={g.name as never} size={size} color={color} style={style} />;
  }
  return <MaterialCommunityIcons name={g.name as never} size={size} color={color} style={style} />;
}
