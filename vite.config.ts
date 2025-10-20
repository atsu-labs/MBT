import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    cloudflareDevProxy(),
    reactRouter(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
