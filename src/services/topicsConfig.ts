// Shared 山手線 お題 backend endpoint. EMPTY url = sync disabled → the app stays 100%
// on-device (custom お題 still work locally; the "みんなのお題" community + voting UI is
// hidden and nothing leaves the device). Fill these in once a backend is provisioned to
// turn on topic sharing + voting + developer analytics. See docs/STATE.md "Topics backend".
//
// The backend must expose 3 endpoints (any host — Supabase, a Cloudflare Worker, Firebase
// Functions, etc.); the exact contract is documented in docs/STATE.md:
//   GET  {url}/topics        -> [{ text: string, votes: number }]  (ranked, top first)
//   POST {url}/topics        <- { installId, text }                (submit a shared お題)
//   POST {url}/votes         <- { installId, text }                (upvote an お題)
// The key is sent as both `apikey` and `Authorization: Bearer <key>` for provider fit.
export const TOPICS_API: { url: string; key: string } = {
  url: '',
  key: '',
};
