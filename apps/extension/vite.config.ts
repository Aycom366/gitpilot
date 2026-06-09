import path from "path";
import { defineConfig, build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync, cpSync } from "fs";

const sharedResolve = {
  alias: { src: path.resolve(__dirname, "./src") },
};

function extensionPlugin() {
  return {
    name: "extension-entries",
    apply: "build" as const,
    async closeBundle() {
      // Content scripts must be self-contained (no imports) — build as IIFE
      for (const name of ["github", "azure"]) {
        await viteBuild({
          configFile: false,
          logLevel: "warn",
          build: {
            lib: {
              entry: path.resolve(__dirname, `src/content/${name}.ts`),
              formats: ["iife"],
              name: "GitPilot",
              fileName: () => `${name}.js`,
            },
            outDir: "dist",
            emptyOutDir: false,
          },
          resolve: sharedResolve,
        });
      }

      // Service worker supports ES modules
      await viteBuild({
        configFile: false,
        logLevel: "warn",
        build: {
          lib: {
            entry: path.resolve(__dirname, "src/background/service-worker.ts"),
            formats: ["es"],
            fileName: () => "service-worker.js",
          },
          outDir: "dist",
          emptyOutDir: false,
        },
        resolve: sharedResolve,
      });

      // Rewrite manifest to point to compiled flat paths
      const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));
      manifest.background.service_worker = "service-worker.js";
      type ContentScript = { js: string[]; [key: string]: unknown };
      manifest.content_scripts = manifest.content_scripts.map(
        (cs: ContentScript) => ({
          ...cs,
          js: cs.js.map((f: string) => path.basename(f).replace(".ts", ".js")),
        }),
      );
      writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));

      try {
        cpSync("icons", "dist/icons", { recursive: true });
      } catch {
        // icons folder may already exist
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), extensionPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "index.html"),
        "auth-callback": path.resolve(__dirname, "auth-callback.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: sharedResolve,
});
