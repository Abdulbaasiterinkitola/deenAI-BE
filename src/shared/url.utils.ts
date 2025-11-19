export function getFrontendUrlFromRefererOrEnv(
  referer?: string,
): string | null {
  const envUrl = process.env.FRONTEND_URL || null;
  const pick = referer?.trim() || envUrl;
  if (!pick) return null;
  return pick.replace(/\/+$/, ''); // remove trailing slashes
}
