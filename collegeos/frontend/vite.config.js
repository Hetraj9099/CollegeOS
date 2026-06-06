import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.png", "favicon.svg"],
            manifest: {
                name: "CollegeOS",
                short_name: "CollegeOS",
                description: "Personal academic operating system",
                theme_color: "#0f172a",
                background_color: "#f8fafc",
                display: "standalone",
                icons: []
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
