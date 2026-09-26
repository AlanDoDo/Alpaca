const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isSameOriginRequest(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return false;

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(originHeader);
    if (originUrl.origin === requestUrl.origin) return true;

    return process.env.NODE_ENV !== "production"
      && localHosts.has(originUrl.hostname)
      && localHosts.has(requestUrl.hostname)
      && originUrl.protocol === requestUrl.protocol
      && originUrl.port === requestUrl.port;
  } catch {
    return false;
  }
}