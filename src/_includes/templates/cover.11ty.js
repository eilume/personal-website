const { imageShortcode } = require("../../_shortcodes");
const chalk = require("chalk");

module.exports = async (post) => {
    if (post.cover != undefined) {
        let cover = post.cover;

        let locale = post.page.filePathStem.match(/\/([a-zA-Z-]+)\//)[1];
        
        if (cover.path == undefined || cover.path == null || cover.path == "") cover.path = "/content/image/blog/fallback/cover.png";
        
        let imageShortcodeOutput = await imageShortcode(false, cover.path, cover.alt != undefined ? cover.alt : "", cover.caption != undefined ? cover.caption : "", cover.credit != undefined ? cover.credit : "", cover.creditUrl != undefined ? cover.creditUrl : "", `cover-${locale}`, `/content/image/blog/${post.translationKey}/`);
        
        // Add sizing + object cover styles
        imageShortcodeOutput = imageShortcodeOutput.replace(/<img[\s]+src=/gm, `<img class="w-full h-80 object-cover" src=`);
        
        return imageShortcodeOutput;
    }
};