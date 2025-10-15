// Simple emoji avatars based on username
const EMOJI_AVATARS = ['😊', '🌟', '🎨', '🚀', '🌈', '🎭', '🌺', '🦋', '🎸', '🌊', '🔥', '💫', '🌙', '☀️', '🍀', '🎯', '🎪', '🌸', '⭐', '🌻'];

export function getEmojiAvatar(username: string): string {
  // Generate a consistent index based on username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % EMOJI_AVATARS.length;
  return EMOJI_AVATARS[index];
}
