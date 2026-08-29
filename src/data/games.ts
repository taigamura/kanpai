// v1 game registry. Anchor = 山手線ゲーム. All offline, single-phone, pass-around.
import type { IconName } from '@/components/Icon';
import { copy } from '@/content/copy';

// Game TITLES are single-sourced from content/copy.json (copy.<id>.title) so the home tiles,
// the roster screen, and each game's own header can never drift apart — edit the title once.
// subtitle/rules stay here (home-tile content, kept in the data layer by design).

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
  icon: IconName;
  needsRoster: boolean; // true => require player names before playing
  minPlayers: number;
  status: 'playable' | 'stub'; // scaffold marker; flip to 'playable' as each is built
  rules: string[]; // shown by the ルール button on the home tile (no need to open the game)
};

export const GAMES: GameDef[] = [
  {
    id: 'yamanote',
    title: copy.yamanote.title,
    subtitle: 'お題に沿って順番に答える定番',
    icon: 'game-yamanote',
    needsRoster: false,
    minPlayers: 2,
    status: 'playable',
    rules: [
      'お題を1つ引き、テンポよく順番に答えていきます。',
      '詰まる・被る・リズムを外したら負け。',
      '負けた人は 罰ゲーム。',
    ],
  },
  {
    id: 'roulette',
    title: copy.roulette.title,
    subtitle: 'スマホを回して…爆発するのは誰だ',
    icon: 'game-roulette',
    needsRoster: false,
    minPlayers: 2,
    status: 'playable',
    rules: [
      'スタートしたらスマホを隣へ回していきます。',
      'ランダムな数秒後に爆発。そのとき持っていた人が負け。',
      '負けた人は 罰ゲーム。',
    ],
  },
  {
    id: 'highlow',
    title: copy.highlow.title,
    subtitle: '次のカードは上か下か',
    icon: 'game-highlow',
    needsRoster: false,
    minPlayers: 1,
    status: 'playable',
    rules: [
      '表示されたカードより、次が上（ハイ）か下（ロー）かを予想。',
      '当たれば次の人へ、外れたら負け。',
      '負けた人は 罰ゲーム。',
    ],
  },
  {
    id: 'chinchiro',
    title: copy.chinchiro.title,
    subtitle: 'サイコロ3つで勝負',
    icon: 'game-chinchiro',
    needsRoster: false,
    minPlayers: 1,
    status: 'playable',
    rules: [
      '順番に3つのサイコロを振り、出た役で勝負します。',
      'シゴロ（4-5-6）やゾロ目は強い役、ヒフミ（1-2-3）や目なしは弱い役。',
      '一番弱い役の人が 罰ゲーム。',
    ],
  },
  {
    id: 'kingscup',
    title: copy.kingscup.title,
    subtitle: 'カードごとにルールが発動',
    icon: 'game-kingscup',
    needsRoster: false,
    minPlayers: 2,
    status: 'playable',
    rules: [
      '中央に空のコップを1つ用意します。山札から1枚引き、出た数字のルールに従います。',
      'K（キング）を引いた人は、自分の飲みものを中央のコップに少し注ぎます。',
      '4枚目のKを引いた人が中央のコップを飲みほします。',
    ],
  },
  {
    id: 'anketo',
    title: copy.anketo.title,
    subtitle: '「誰が一番◯◯？」をこっそり投票',
    icon: 'game-anketo',
    needsRoster: true,
    minPlayers: 3,
    status: 'playable',
    rules: [
      'お題にスマホを回して、1人ずつこっそり投票します。',
      '全員の投票が終わると集計を発表。',
      '最多得票の人が 罰ゲーム。',
    ],
  },
];
