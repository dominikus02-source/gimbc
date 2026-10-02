import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The game lives in /game/pendekar-suryakerta/web, while shared game
  // assets live in the repository-level /public/game/assets directory.
  publicDir: "../../../public",
  server: { host: "0.0.0.0", port: 8080 },
  preview: { host: "0.0.0.0", port: 8080 },
});
