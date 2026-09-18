import { getNews } from "../../server/news.js";

export async function onRequestGet({ request }) {
  const requestUrl = new URL(request.url);
  const language = requestUrl.searchParams.get("language") || "en";

  try {
    const news = await getNews({ language });

    return Response.json(news, {
      headers: { "Cache-Control": "public, max-age=900" },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Could not load news" },
      { status: 502 },
    );
  }
}
