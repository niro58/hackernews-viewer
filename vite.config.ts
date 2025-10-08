import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), crx({ manifest }), tailwindcss()],

  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
  server: {
    port: 5177,
    strictPort: true,
    hmr: {
      clientPort: 5177,
    },
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
});
