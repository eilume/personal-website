const { imageShortcode } = require("../../_shortcodes");
const chalk = require("chalk");

module.exports = async (post) => {
    if (post.cover != undefined) {
        let cover = post.cover;

        let locale = post.page.inputPath.match(/\/src\/([a-zA-Z-]+)\//)[1];
        
        if (cover.path == undefined || cover.path == null || cover.path == "") cover.path = "/content/image/blog/fallback/cover.png";
        
        let imageShortcodeOutput = await imageShortcode(false, cover.path, cover.alt != undefined ? cover.alt : "", cover.caption != undefined ? cover.caption : "", "", "", `cover-${locale}`, `/content/image/blog/${post.translationKey}/`, [400, 800, 1200]);
        
        // Add sizing + object cover styles
        imageShortcodeOutput = imageShortcodeOutput.replace(/<img[\s]+src=/gm, `<img class="w-full xl:w-64 h-40 xl:h-16 object-cover" src=`);
        
        return imageShortcodeOutput;
    }
};