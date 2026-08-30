// お題プール for 意思疎通ゲーム.
// Each theme defines a scale: a player's secret number 1–100 maps onto it, and they name something
// of that magnitude. `low` describes number 1, `high` describes number 100. Near-infinite answers
// per theme is the point. Family-friendly (no 下ネタ). Content lives in the data layer by design.
export type NumberLineTheme = {
  theme: string; // the category / prompt
  low: string; // what "1" feels like
  high: string; // what "100" feels like
};

export const NUMBERLINE_THEMES: NumberLineTheme[] = [
  { theme: '動物の大きさ', low: 'とても小さい', high: 'とても大きい' },
  { theme: '夏に食べたいもの', low: '食べたくない', high: 'めっちゃ食べたい' },
  { theme: '強そうな動物', low: '弱い', high: '最強' },
  { theme: '有名なアニメ', low: 'マイナー', high: '超有名' },
  { theme: '高い食べ物', low: '安い', high: '超高級' },
  { theme: '怖いもの', low: '全然平気', high: '超怖い' },
  { theme: '熱いもの', low: '冷たい', high: '激熱' },
  { theme: '人気の観光地', low: 'マイナー', high: '超人気' },
  { theme: '痛いこと', low: '痛くない', high: '激痛' },
  { theme: '恥ずかしいこと', low: '平気', high: '死ぬほど恥ずかしい' },
  { theme: 'ブランドといえば', low: '庶民的', high: '超高級' },
  { theme: '便利な発明', low: 'まあ便利', high: '世界を変えた' },
  { theme: '面倒な家事', low: '楽ちん', high: '超面倒' },
  { theme: 'テンションが上がること', low: 'まあまあ', high: '最高潮' },
  { theme: '速い乗り物', low: 'のんびり', high: '超スピード' },
  { theme: 'モテそうな趣味', low: '地味', high: '超モテる' },
  { theme: '重いもの', low: '軽い', high: '超重い' },
  { theme: '甘い食べ物', low: '甘くない', high: '激甘' },
  { theme: '行列ができる店', low: 'すぐ入れる', high: '何時間も待つ' },
  { theme: '子どもが喜ぶもの', low: '無反応', high: '大興奮' },
  { theme: '長く続くもの', low: 'すぐ終わる', high: 'いつまでも' },
  { theme: '緊張する場面', low: 'リラックス', high: '極度の緊張' },
  { theme: '嬉しいプレゼント', low: '微妙', high: '飛び上がるほど嬉しい' },
  { theme: '寒い場所', low: '暖かい', high: '極寒' },
  { theme: '難しい資格', low: '簡単', high: '超難関' },
  { theme: 'お金がかかる趣味', low: 'お金いらず', high: '青天井' },
  { theme: '有名な歴史上の人物', low: 'マニアック', high: '誰でも知ってる' },
  { theme: '疲れるスポーツ', low: '楽', high: 'クタクタ' },
  { theme: '眠くなる時間', low: '全然眠くない', high: '爆睡' },
  { theme: 'テンションが下がること', low: '平気', high: 'どん底' },
  { theme: '辛い食べ物', low: '辛くない', high: '激辛' },
  { theme: '大人っぽい飲み物', low: '子どもっぽい', high: '超大人' },
  { theme: '売れてる商品', low: '不人気', high: '大ヒット' },
  { theme: '朝が弱そうな仕事', low: '朝に強い', high: '朝が地獄' },
  { theme: '記念日に行きたい場所', low: '普段づかい', high: '特別な日' },
  { theme: '掃除が大変な場所', low: 'すぐ済む', high: '一日仕事' },
  { theme: '懐かしいもの', low: '最近', high: '大昔' },
  { theme: '丈夫なもの', low: 'すぐ壊れる', high: '一生もの' },
  { theme: 'びっくりする金額', low: '安い', high: '目が飛び出る' },
  { theme: '運動神経が必要なこと', low: '誰でもできる', high: 'プロ級' },
];
