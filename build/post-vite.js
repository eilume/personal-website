const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');


fs_extra.copySync("./public/content/image/", "./dist/content/image/");

fs.copyFileSync("./public/_redirects", "./dist/_redirects");
fs.copyFileSync("./public/robots.txt", "./dist/robots.txt");
fs.copyFileSync("./public/sitemap.xml", "./dist/sitemap.xml");