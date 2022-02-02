const { imageShortcode } = require("../../_shortcodes");
const chalk = require("chalk");

module.exports = (cover) => {
    // TODO: generate open-graph specific images too
    if (cover.path != undefined)
    {
        let locale = cover.page.filePathStem.match(/\/content\/([a-zA-Z-]+)\//)[1];

        return imageShortcode(false, cover.path, cover.alt != undefined ? cover.alt : "", cover.caption != undefined ? cover.caption : "", cover.credit != undefined ? cover.credit : "", cover.creditUrl != undefined ? cover.creditUrl : "", `cover-${locale}`, `/content/image/blog/${cover.page.fileSlug}/`);
    }
};