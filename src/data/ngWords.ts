// Client-side NG-word filter for shared お題 (Guideline 1.2). The backend runs the same check in
// `submit_topic` (supabase/schema.sql → banned_words); this copy gives instant feedback on submit
// and filters anything that slipped into the community list. Matching is a case-insensitive
// substring test, so keep entries specific enough not to catch normal お題.
const NG_WORDS: string[] = [
  '死ね', '殺す', 'ころす', 'きもい', 'キモい', 'ブス', 'ちんこ', 'まんこ',
  'セックス', 'エロ', 'レイプ', 'ガイジ', '池沼', 'シナ人', 'ニガー',
  'fuck', 'shit', 'sex', 'nigger', 'http', 'www.',
];

export function containsNgWord(text: string): boolean {
  const t = text.toLowerCase();
  return NG_WORDS.some((w) => t.includes(w.toLowerCase()));
}
