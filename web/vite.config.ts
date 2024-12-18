import { defineConfig } from "vitest/config"
import * as path from "path"
import react from "@vitejs/plugin-react-swc"
import glsl from "vite-plugin-glsl"

const basePath = "/web/"
const serverPort = 3000
const dockerServerPort = 3003

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), glsl() /* viteSingleFile() */],
    resolve: {
        alias: [
            {
                find: "@/components",
                replacement: path.resolve(__dirname, "src", "ui", "components"),
            },
            {
                find: "@/modals",
                replacement: path.resolve(__dirname, "src", "ui", "modals"),
            },
            {
                find: "@/panels",
                replacement: path.resolve(__dirname, "src", "ui", "panels"),
            },
            { find: "@", replacement: path.resolve(__dirname, "src") },
        ],
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
    server: {
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000
        port: serverPort,
        cors: false,
        proxy: {
            "/api/mira": {
                target: `http://localhost:${serverPort}${basePath}`,
                changeOrigin: true,
                secure: false,
                rewrite: path =>
                    path.replace(/^\/api\/mira/, "/Downloadables/Mira"),
            },
            "/api/auth": {
                target: `http://localhost:${dockerServerPort}/`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        target: "esnext",
    },
    base: basePath,
})
