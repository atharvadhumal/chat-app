const AVATAR_STYLES = [
  "glass",
  "shapes",
  "notionists",
  "lorelei",
  "avataaars",
  "bottts-neutral",
  "thumbs",
  "rings",
  "identicon",
  "fun-emoji",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export type GeneratedAvatar = {
  style: AvatarStyle;
  seed: string;
  url: string;
};

export function randomSeed() {
  return `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function buildAvatarUrl(style: AvatarStyle | string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}&size=256`;
}

export function avatarFromUser(idOrName: string) {
  return buildAvatarUrl("glass", idOrName);
}

export function generateRandomAvatar(
  style?: AvatarStyle,
): GeneratedAvatar {
  const chosen =
    style ?? AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = randomSeed();
  return { style: chosen, seed, url: buildAvatarUrl(chosen, seed) };
}

export function generateAvatarOptions(count = 9): GeneratedAvatar[] {
  return Array.from({ length: count }, () => generateRandomAvatar());
}

export { AVATAR_STYLES };
