import { defineConfig } from "vite";

export default defineConfig({
    root: "./tests",
    build: {
        outDir: "./dist",
    },
    server: {
        port: 3030,
    },
});
