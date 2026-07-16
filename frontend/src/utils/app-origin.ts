const LOCAL_HOSTS = new Set(['0.0.0.0', '127.0.0.1', 'localhost'])

function normalizeOrigin(candidate: string | null | undefined) {
  if (!candidate) {
    return null
  }

  const trimmed = candidate.trim()
  if (!trimmed) {
    return null
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)

    if (url.hostname === '0.0.0.0') {
      url.hostname = 'localhost'
      url.protocol = 'http:'
    }

    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      url.protocol = 'http:'
    }

    return url.origin
  } catch {
    return null
  }
}

function isLocalOrigin(origin: string) {
  try {
    return LOCAL_HOSTS.has(new URL(origin).hostname)
  } catch {
    return false
  }
}

function getEnvironmentOrigins() {
  return [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin))
}

export function resolveAppOrigin(options?: {
  forwardedProto?: string | null
  forwardedHost?: string | null
  requestUrl?: string | null
}) {
  const requestOrigin = options?.forwardedHost
    ? normalizeOrigin(`${options.forwardedProto ?? 'https'}://${options.forwardedHost}`)
    : normalizeOrigin(options?.requestUrl)

  const environmentOrigins = getEnvironmentOrigins()
  const allCandidates = [requestOrigin, ...environmentOrigins].filter(
    (origin): origin is string => Boolean(origin)
  )

  if (process.env.NODE_ENV === 'production') {
    const firstRemoteOrigin = allCandidates.find((origin) => !isLocalOrigin(origin))
    if (firstRemoteOrigin) {
      return firstRemoteOrigin
    }
  }

  return allCandidates[0] ?? 'http://localhost:3000'
}
