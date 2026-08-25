// v1 game registry. Anchor = 山手線ゲーム. All offline, single-phone, pass-around.
export type GameId =
  | 'yamanote'
  | 'roulette'
  | 'highlow'
  | 'chinchiro'
  | 'kingscup'
  | 'anketo';

export type GameDef = {
  id: GameId;
  title: string;
  subtitle: string;
  emoji: string;
  needsRoster: boolean; // true => require player names before playing
  minPlayers: number;
  status: 'playable' | 'stub'; // scaffold marker; flip to 'playable' as each is built
};

export const GAMES: GameDef[] = [
  {
    id: 'yamanote',
    title: '山手線ゲーム',
    subtitle: 'お題に沿って順番に答える定番',
    emoji: '🚃',
    needsRoster: false,
    minPlayers: 2,
    status: 'playable',
  },
  {
    id: 'roulette',
    title: 'ロシアンルーレット',
    subtitle: 'スマホを回して…爆発するのは誰だ',
    emoji: '💣',
    needsRoster: false,
    minPlayers: 2,
    status: 'playable',
  },
  {
    id: 'highlow',
    title: '高低（ハイ&ロー）',
    subtitle: '次のカードは上か下か',
    emoji: '🃏',
    needsRoster: false,
    minPlayers: 1,
    status: 'playable',
  },
  {
    id: 'chinchiro',
    title: 'チンチロ',
    subtitle: 'サイコロ3つで勝負',
    emoji: '🎲',
    needsRoster: false,
    minPlayers: 1,
    status: 'playable',
  },
  {
    id: 'kingscup',
    title: 'キングスカップ',
    subtitle: 'カードごとにルールが発動',
    emoji: '👑',
    needsRoster: false,
    minPlayers: 2,
    status: 'stub',
  },
  {
    id: 'anketo',
    title: '匿名アンケート',
    subtitle: '「誰が一番◯◯？」をこっそり投票',
    emoji: '🗳️',
    needsRoster: true,
    minPlayers: 3,
    status: 'stub',
  },
];
