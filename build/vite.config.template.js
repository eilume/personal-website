import { resolve } from 'path'
import { defineConfig } from 'vite'
import { minifyHtml } from 'vite-plugin-html'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    root: "public",
    plugins: [
        minifyHtml(),
        VitePWA()
    ],
    build: {
        outDir: "../dist",
        rollupOptions: {
            input: {},
            external: ["public/assets/css/styles.css"]
        },
    }
});