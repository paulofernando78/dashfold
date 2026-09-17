const NEWS_CACHE_TTL = 15 * 60 * 1000;
const newsCache = new Map();

const languageSettings = {
  en: { lang: "en", country: "us" },
  pt: { lang: "pt", country: "br" },
};

function normalizeLanguage(language) {
  return languageSettings[language] ? language : "en";
}

export async function getNews({ language, apiKey }) {
  if (!apiKey) throw new Error("GNEWS_API_KEY is not configured");

  const normalizedLanguage = normalizeLanguage(language);
  const cached = newsCache.get(normalizedLanguage);

  if (cached && Date.now() - cached.createdAt < NEWS_CACHE_TTL) {
    return cached.data;
  }

  const { lang, country } = languageSettings[normalizedLanguage];
  const url = new URL("https://gnews.io/api/v4/top-headlines");
  url.searchParams.set("category", "general");
  url.searchParams.set("lang", lang);
  url.searchParams.set("country", country);
  url.searchParams.set("max", "10");
  url.searchParams.set("apikey", apiKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.errors?.[0] || `GNews returned ${response.status}`);
    }

    const articles = (payload?.articles ?? []).map((article) => ({
      title: article.title,
      description: article.description,
      image: article.image,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source?.name || "",
    }));

    const data = { articles, language: normalizedLanguage };
    newsCache.set(normalizedLanguage, { createdAt: Date.now(), data });
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
