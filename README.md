# Personal Website

<p align="center">
    <img alt="Latest Version" src="https://img.shields.io/github/v/tag/eilume/personal-website?color=ff594d&style=flat-square">
    <img alt="License: MIT" src="https://img.shields.io/github/license/eilume/personal-website?color=ff594d&style=flat-square">
</p>

> My [personal website](https://eilu.me) for stuff I'm up to. Built with [Eleventy/11ty](https://www.11ty.dev), [tailwindcss](https://tailwindcss.com) and [Vite](https://vitejs.dev).

> This isn't supposed to be used as a template, some aspects are quite messy and I won't be providing support for this repo.

## Features

- **Multi-Lingual Support** - Supports multiple languages for each page
- **Blog System** - Simple blogging system utilizing 11ty
  - **Tag System** - Filter blog posts by specific tag
  <!-- - **Scrolling Table Of Contents** -  -->
  <!-- - **Automated Front-Matter Time-Stamping** -  -->
  <!-- - **Post Modify History Timeline** -  -->
- **Build Optimizations** - Produce bundled, file-size optimized assets via Vite's config for rollup (see [build-info](#build-info))
- **Image Optimizations** - Compression with [sharp](https://sharp.pixelplumbing.com), client-side image switching and lazy-loading (JS required)
<!-- - **Video Optimizations** -  -->
<!-- - **Audio Optimizations** -  -->
- **Sitemap Generation** - Generate list of all published pages on the site
- **Open Graph Support** - Meta tags for each page with appropriate data
  - **Automated Page Covers** - Auto-generate page covers using a template via [skia-canvas](https://github.com/samizdatco/skia-canvas)
- **Responsive Design** - Responsive, mobile-first design via tailwindcss
- **Light and Dark Theme** - Toggle-able theme switching using [tailwindcss' dark mode]()
- **Minimal Bloat** - Keeps download sizes in mind
- **Support Non-JS Supported/Enabled Browsers** - Rely on as little client-side JS with some CSS tricks
<!-- - **CMS Support** -  -->

## Build Info

The build scripts used to specify what files should be optimized/bundled are less than ideal and use vite in a very unorthodox and hacky way, as you'll see below.

What running `npm run build` does:

1. Clears the `dist/` folder
2. Builds tailwind's production `.css` file
3. Builds the production version of the static site files with 11ty  
4. Runs [build/pre-vite.js](build/pre-vite.js), which makes a clone of `build/vite.config.template.js` and scans the `public/` folder for all `.html`, `.css` and `.js` files, adding references to them in the copied config
5. Runs vite with the new config file
6. Runs [build/post-vite.js](build/post-vite.js), which updates various file references in the vite processed files and copies various other files + folders into the `dist/` folder

## Learning/Referenced Resources

- [11ty/eleventy-base-blog (Github Repo)](https://github.com/11ty/eleventy-base-blog)
- [Webstoemp/Jérôme Coupé - Multi-lingual Sites with Eleventy (Blog Post)](https://www.webstoemp.com/blog/multilingual-sites-eleventy/)
- [lea37/eleventy-multilingual (Github Repo)](https://github.com/lea37/eleventy-multilingual/)
- [marcamos/jet (Github Repo)](https://github.com/marcamos/jet)
- [belter.io - 11ty Sitemap (Blog Post)](https://www.belter.io/eleventy-sitemap/)
- [Aleksandr Hovhannisyan - Lazily Loading Images (Blog Post)](https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/)
