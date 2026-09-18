const NEWS_CACHE_TTL = 15 * 60 * 1000;
const newsCache = new Map();

const newsFeeds = {
  en: {
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
  },
  pt: {
    source: "Agência Brasil",
    url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
  },
};

function normalizeLanguage(language) {
  return newsFeeds[language] ? language : "en";
}

function decodeXml(value = "") {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function stripHtml(value = "") {
  return decodeXml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(item, tagName) {
  const escapedTagName = tagName.replace(":", "\\:");
  const match = item.match(
    new RegExp(
      `<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`,
      "i",
    ),
  );

  return match?.[1] ?? "";
}

function getAttribute(item, tagNames, attributeName) {
  for (const tagName of tagNames) {
    const escapedTagName = tagName.replace(":", "\\:");
    const tag = item.match(
      new RegExp(`<${escapedTagName}\\b[^>]*>`, "i"),
    )?.[0];
    const attribute = tag?.match(
      new RegExp(`${attributeName}=["']([^"']+)["']`, "i"),
    )?.[1];

    if (attribute) return decodeXml(attribute);
  }

  return "";
}

function getImage(item, description) {
  const mediaImage = getAttribute(
    item,
    ["media:content", "media:thumbnail", "enclosure"],
    "url",
  );

  if (mediaImage) return mediaImage;

  return decodeXml(description).match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || "";
}

function parseRss(xml, source) {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return items
    .map((item) => {
      const description = getTag(item, "description");
      const publishedAt = getTag(item, "pubDate");

      return {
        title: stripHtml(getTag(item, "title")),
        description: stripHtml(description),
        image: getImage(item, description),
        url: decodeXml(getTag(item, "link")),
        publishedAt: publishedAt
          ? new Date(decodeXml(publishedAt)).toISOString()
          : "",
        source,
      };
    })
    .filter((article) => article.title && article.url)
    .filter(
      (article, index, articles) =>
        articles.findIndex((candidate) => candidate.url === article.url) === index,
    )
    .slice(0, 10);
}

export async function getNews({ language }) {
  const normalizedLanguage = normalizeLanguage(language);
  const cached = newsCache.get(normalizedLanguage);

  if (cached && Date.now() - cached.createdAt < NEWS_CACHE_TTL) {
    return cached.data;
  }

  const feed = newsFeeds[normalizedLanguage];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(feed.url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "Dashfold-News/1.0",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${feed.source} returned ${response.status}`);
    }

    const articles = parseRss(await response.text(), feed.source);

    if (articles.length === 0) {
      throw new Error(`${feed.source} returned an empty or invalid feed`);
    }

    const data = {
      articles,
      language: normalizedLanguage,
      source: feed.source,
    };

    newsCache.set(normalizedLanguage, { createdAt: Date.now(), data });
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
