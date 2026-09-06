import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// dev server：後端無 CORS 且不可改，靠 proxy 轉發同源請求
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8087", changeOrigin: true },
      "/health": { target: "http://localhost:8087", changeOrigin: true },
      "/login": { target: "http://localhost:8087", changeOrigin: true },
      "/logout": { target: "http://localhost:8087", changeOrigin: true },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
