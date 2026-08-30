import React from 'react';
import type { GameId } from '@/data/games';
import { YamanoteGame } from './YamanoteGame';
import { RouletteGame } from './RouletteGame';
import { HighLowGame } from './HighLowGame';
import { ChinchiroGame } from './ChinchiroGame';
import { KingsCupGame } from './KingsCupGame';
import { AnketoGame } from './AnketoGame';
import { KatakanaGame } from './KatakanaGame';
import { NumberLineGame } from './NumberLineGame';

export function GameHost({ id }: { id: GameId }) {
  switch (id) {
    case 'yamanote':
      return <YamanoteGame />;
    case 'roulette':
      return <RouletteGame />;
    case 'highlow':
      return <HighLowGame />;
    case 'chinchiro':
      return <ChinchiroGame />;
    case 'kingscup':
      return <KingsCupGame />;
    case 'anketo':
      return <AnketoGame />;
    case 'katakana':
      return <KatakanaGame />;
    case 'numberline':
      return <NumberLineGame />;
    default:
      return null;
  }
}
