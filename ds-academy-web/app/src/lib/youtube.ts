/**
 * Normalises whatever an admin pastes into a "YouTube ID" field into a
 * clean 11-character video ID, or '' if it isn't recognisable as one.
 *
 * Built after a real incident: a testimonial's youtubeId field had the
 * video's *title* pasted into it instead of a link/ID, which YouTube's
 * embed player then failed on with a generic "Playback ID" error shown
 * to real site visitors. Rather than trust free-text input, every save
 * runs through this — a bare ID, a youtube.com/watch, youtu.be, /embed/
 * or /shorts/ link all resolve; anything else (a title, a stray phrase)
 * comes out empty, which just turns the video slot off gracefully
 * instead of shipping a broken player.
 */
export function extractYouTubeId(input: string): string {
  const s = (input || '').trim();
  if (!s) return '';

  const ID = '[A-Za-z0-9_-]{11}';

  // Already a bare ID.
  if (new RegExp(`^${ID}$`).test(s)) return s;

  // youtu.be/<id>
  let m = s.match(new RegExp(`youtu\\.be/(${ID})`));
  if (m) return m[1];

  // youtube.com/watch?v=<id>  (v= can be anywhere in the query string)
  m = s.match(new RegExp(`[?&]v=(${ID})`));
  if (m) return m[1];

  // youtube.com/embed/<id> or /shorts/<id> or /live/<id>
  m = s.match(new RegExp(`youtube\\.com/(?:embed|shorts|live)/(${ID})`));
  if (m) return m[1];

  return '';
}

/** YouTube's own thumbnail for a video ID — no API key needed, this URL pattern is public. */
export function youtubeThumbnailUrl(youtubeId: string): string {
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '';
}
