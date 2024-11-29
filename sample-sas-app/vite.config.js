import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/lsaf/webdav/repo/general/biostat/tools/sample-sas-app",
  build: { target: "ES2022" },
});
