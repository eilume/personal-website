const { imageShortcode } = require("../../_shortcodes");
const chalk = require("chalk");

module.exports = async (cover) => {
    if (cover.path != undefined)
    {
        let locale = cover.page.filePathStem.match(/\/content\/([a-zA-Z-]+)\//)[1];

        let imageShortcodeOutput = await imageShortcode(false, cover.path, cover.alt != undefined ? cover.alt : "", cover.caption != undefined ? cover.caption : "", cover.credit != undefined ? cover.credit : "", cover.creditUrl != undefined ? cover.creditUrl : "", `cover-${locale}`, `/content/image/blog/${cover.page.fileSlug}/`);
        imageShortcodeOutput = imageShortcodeOutput.replace(/<img[\s]+src=/gm, `<img class="w-full h-80 object-cover" src=`);

        return imageShortcodeOutput;
    }
};