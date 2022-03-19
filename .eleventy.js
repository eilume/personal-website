const { DateTime } = require("luxon");
const moment = require("moment");
const { highlightShortcode, imageShortcode } = require("./src/_shortcodes");
const { capitalizeFirst, capitalizeAll } = require("./src/_filters");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginNavigation = require("@11ty/eleventy-navigation");

module.exports = function (config) {
    const now = new Date();

    const isProduction = process.env.ELEVENTY_PRODUCTION == 1;
    
    let publishedPosts;
    if (isProduction)
    {
        publishedPosts = (post) => post.date <= now && !post.data.draft && !post.data.private;
    } else {
        publishedPosts = (post) => !post.data.private;
    }
    
    // Plugins
    config.addPlugin(syntaxHighlight);
    config.addPlugin(EleventyRenderPlugin);
    config.addPlugin(pluginRss);
    config.addPlugin(pluginNavigation);

    // Filters
    // Date filter (localized)
    config.addFilter("date", function (date, format, locale) {
        locale = locale ? locale : "en";
        moment.locale(locale);
        return moment(date).format(format);
    });

    config.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    });
    
    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    config.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });
    
    // Get the first `n` elements of a collection.
    config.addFilter("head", (array, n) => {
        if(!Array.isArray(array) || array.length === 0) {
          return [];
        }
        if( n < 0 ) {
          return array.slice(n);
        }
    
        return array.slice(0, n);
    });

    // Return the smallest number argument
    config.addFilter("min", (...numbers) => {
        return Math.min.apply(null, numbers);
    });

    function filterTagList(tags) {
        return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
    }
    
    config.addFilter("filterTagList", filterTagList);

    // Collections
    // 'en' - Blog Posts
    config.addCollection("blogposts_en", function (collection) {
        return collection.getFilteredByGlob("./src/content/en/blog/*.md").filter(publishedPosts);
    });

    // 'en' - Blog Tags
    config.addCollection("blogtags_en", function (collection) {
        let tagSet = new Set();
        // TODO: figure out if i can reuse `blogposts_en` collection, instead of "recreating" it
        collection.getFilteredByGlob("./src/content/en/blog/*.md").filter(publishedPosts).forEach(item => {
            (item.data.tags || []).forEach(tag => {
                tagSet.add(tag);
            });
        });
    
        return filterTagList([...tagSet]);
    });

    config.setUseGitIgnore(true);

    config.addWatchTarget("./src/assets/css/tailwind.css");

    config.addPassthroughCopy("./src/assets/");

    config.addPassthroughCopy("./src/robots.txt");
    config.addPassthroughCopy("./src/_redirects");

    config.addPairedShortcode("highlight", highlightShortcode);
    config.addShortcode("image", imageShortcode);

    config.addFilter("capitalizeFirst", capitalizeFirst);

    config.addFilter("capitalizeAll", capitalizeAll);

    return {
        passthroughFileCopy: true,
        dir: {
            input: "src",
            output: "public",
        }
    };
}
