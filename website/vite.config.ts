import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import publication from "./publication.json" with { type: "json" };

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, ".", "WM_SITE_");
  return {
    plugins: [react(), {
      name: "publication-metadata",
      transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", publication.site_url).replaceAll("__SITE_TITLE__", publication.title)
        .replaceAll("__REPOSITORY_URL__", publication.repository_url).replaceAll("__VERSION__", publication.version)
        .replace("<!-- theme-init -->", '<script src="./theme-init.js"></script>'),
    }],
    base: "./",
    define: { "import.meta.env.VITE_STATIC_DOCS": JSON.stringify(environment.WM_SITE_STATIC_DOCS ?? "0") },
    publicDir: environment.WM_SITE_PUBLIC_DIR ?? "public",
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
    },
    preview: { host: "127.0.0.1" },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
