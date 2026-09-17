import { useEffect, useState } from "react";

import { useLanguage } from "@/i18n";
import { WidgetBody, WidgetControls } from "@/components/ui/Widget";

function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-3 animate-pulse">
          <div className="h-14 w-18 shrink-0 rounded bg-white/10" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-3 rounded bg-white/15" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function News({ onDelete }) {
  const { language, locale, t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadNews() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/news?language=${encodeURIComponent(language)}`,
          { signal: controller.signal },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || t("newsError"));
        }

        if (isActive) setArticles(payload.articles ?? []);
      } catch (requestError) {
        if (isActive && requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadNews();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [language, refreshKey, t]);

  function formatPublishedAt(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  return (
    <WidgetBody
      middlePosition="top"
      middle={
        <div className="flex h-full min-h-0 flex-col gap-3">
          <h3 className="shrink-0 text-lg font-bold uppercase">
            {t("latestNews")}
          </h3>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <NewsSkeleton />
            ) : error ? (
              <p className="text-sm leading-5 text-red-300">{error}</p>
            ) : articles.length === 0 ? (
              <p className="text-sm text-gray-300">{t("noNews")}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {articles.map((article) => (
                  <li key={`${article.url}-${article.publishedAt}`}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${t("openArticle")}: ${article.title}`}
                      className="group flex gap-3"
                    >
                      {article.image && (
                        <img
                          src={article.image}
                          alt=""
                          loading="lazy"
                          className="h-14 w-18 shrink-0 rounded object-cover bg-white/10"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-semibold leading-4 group-hover:underline">
                          {article.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-gray-400">
                          {[article.source, formatPublishedAt(article.publishedAt)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      }
      bottom={
        <WidgetControls>
          <WidgetControls.Reset onClick={() => setRefreshKey((key) => key + 1)} />
          <WidgetControls.Delete onClick={onDelete} />
        </WidgetControls>
      }
    />
  );
}
