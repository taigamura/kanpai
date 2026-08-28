// Supabase project for shared 山手線 お題. EMPTY url = sync disabled → the app stays 100%
// on-device (custom お題 still work locally; the "みんなのお題" community + voting UI is hidden
// and nothing leaves the device, not even an install id). Fill both in to turn on topic
// sharing + voting + developer analytics.
//
// Setup (one time):
//   1. Create a Supabase project (free tier is fine).
//   2. In the SQL editor, run `supabase/schema.sql` from this repo.
//   3. Settings → API: copy the Project URL and the `anon` public key below.
//      (The anon key is publishable — safe to ship in the app. Never put the service_role key here.)
//   4. Turning this on collects data (submitted text + anonymous install id), so update the
//      App Store App Privacy labels + docs/terms.html before shipping that build. See docs/STATE.md.
//
// The client talks to Supabase directly: GET on the `topics` table (PostgREST) for the ranked
// list, and the `submit_topic` / `vote_topic` RPCs for writes.
export const TOPICS_API: { url: string; anonKey: string } = {
  url: 'https://driqzhzlejeujfzwtstg.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXF6aHpsZWpldWpmend0c3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4ODA4MDgsImV4cCI6MjEwMzQ1NjgwOH0.JkxF1y9-OGDsidOjrucwipFojMRaza-M6RtO6Kg-eEI',
};
