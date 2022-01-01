import { resolve } from 'path';
import { defineConfig } from 'vite';
import { minifyHtml } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import compress from 'vite-plugin-compress';

export default defineConfig({
    root: "public",
    plugins: [
        minifyHtml(),
        VitePWA(),
        compress({
            brotli: false
        })
    ],
    build: {
        outDir: "../dist",
        rollupOptions: {
            input: {},
            external: ["public/assets/css/styles.css"]
        },
    }
});