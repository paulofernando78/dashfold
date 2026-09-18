import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLinkPreview } from "./server/linkPreview.js";
import { getNews } from "./server/news.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "link-preview-api",
      configureServer(server) {
        server.middlewares.use("/api/link-preview", async (request, response) => {
          const requestUrl = new URL(request.url, "http://localhost");
          const targetUrl = requestUrl.searchParams.get("url");

          try {
            const preview = await getLinkPreview(targetUrl);
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(preview));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: error.message }));
          }
        });
      },
    },
    {
      name: "news-api",
      configureServer(server) {
        server.middlewares.use("/api/news", async (request, response) => {
          const requestUrl = new URL(request.url, "http://localhost");
          const language = requestUrl.searchParams.get("language") || "en";

          try {
            const news = await getNews({ language });
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.setHeader("Cache-Control", "public, max-age=900");
            response.end(JSON.stringify(news));
          } catch (error) {
            response.statusCode = 502;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({ error: error.message || "Could not load news" }),
            );
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
