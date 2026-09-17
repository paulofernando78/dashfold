const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
];

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const openGraphTitle = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  )?.[1];
  const reversedOpenGraphTitle = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
  )?.[1];
  const documentTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  return decodeHtml(openGraphTitle || reversedOpenGraphTitle || documentTitle || "");
}

function validateUrl(value) {
  if (!value) throw new Error("URL is required");

  const url = new URL(value);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))) {
    throw new Error("Private network URLs are not allowed");
  }

  return url;
}

export async function getLinkPreview(value) {
  const url = validateUrl(value);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Dashfold-LinkPreview/1.0",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Website returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw new Error("URL does not point to an HTML page");
    }

    const html = (await response.text()).slice(0, 300_000);
    const resolvedUrl = validateUrl(response.url).toString();
    const title = extractTitle(html) || new URL(resolvedUrl).hostname.replace(/^www\./, "");

    return { title, url: resolvedUrl };
  } finally {
    clearTimeout(timeoutId);
  }
}
