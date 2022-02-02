const moment = require("moment");
const { highlightShortcode, imageShortcode } = require("./src/_shortcodes");
const { EleventyRenderPlugin } = require("@11ty/eleventy");

// TODO: add tag filtering

module.exports = function (config) {
    config.addPlugin(EleventyRenderPlugin);

    // Date filter (localized)
    config.addFilter("date", function (date, format, locale) {
        locale = locale ? locale : "en";
        moment.locale(locale);
        return moment(date).format(format);
    });

    // Collections
    config.addCollection("blogposts_en", function (collection) {
        return collection.getFilteredByGlob("./src/content/en/posts/*.md");
    });

    config.setUseGitIgnore(true);

    config.addWatchTarget("./src/assets/css/tailwind.css");

    config.addPassthroughCopy("./src/assets/");

    config.addPassthroughCopy("./src/robots.txt");
    config.addPassthroughCopy("./src/_redirects");

    config.addPairedShortcode("highlight", highlightShortcode);
    config.addShortcode("image", imageShortcode);

    return {
        passthroughFileCopy: true,
        dir: {
            input: "src",
            output: "public",
        }
    };
}
