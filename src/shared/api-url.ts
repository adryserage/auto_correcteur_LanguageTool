/**
 * Normalize a user-entered LanguageTool server URL.
 * The client appends `/v2/...` itself, so a trailing `/v2` is stripped.
 * Returns null when the input is not a valid http(s) URL.
 */
export function normalizeApiUrl(input: string): string | null {
  return normalizeUrl(input, /\/v2$/)
}

/**
 * Normalize a user-entered rephrase server URL (OpenAI-compatible).
 * The client appends `/v1/...` itself, so a trailing `/v1` is stripped.
 */
export function normalizeRephraseUrl(input: string): string | null {
  return normalizeUrl(input, /\/v1$/)
}

function normalizeUrl(input: string, versionSuffix: RegExp): string | null {
  const trimmed = input.trim().replace(/\/+$/, '').replace(versionSuffix, '')

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null
  }

  return trimmed
}

/** Host permission pattern for the origin of an API URL, e.g. `https://example.com/*` */
export function originPattern(apiUrl: string): string {
  return `${new URL(apiUrl).origin}/*`
}
