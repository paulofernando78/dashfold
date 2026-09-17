import { getLinkPreview } from "../../server/linkPreview.js";

export async function onRequestGet({ request }) {
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get("url");

  try {
    const preview = await getLinkPreview(targetUrl);

    return Response.json(preview, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Could not load link preview" },
      { status: 400 },
    );
  }
}
