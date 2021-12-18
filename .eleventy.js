const moment = require("moment");
const Image = require('@11ty/eleventy-img');
const path = require("path");

const ImageWidths = {
    ORIGINAL: null,
    PLACEHOLDER: 24,
};

// From: https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/
const imageShortcode = async (
    src,
    alt,
    className,
    widths = [400, 800, 1280, 2560],
    baseFormat = 'jpeg',
    optimizedFormats = ['avif', 'webp'],
    sizes = '100vw'
) => {
    const { name: imgName, dir: imgDir } = path.parse(src);
    const fullSrc = path.join('src', src);

    // Generate images
    const imageMetadata = await Image(fullSrc, {
        // widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...widths],
        widths: [ImageWidths.PLACEHOLDER, ...widths],
        formats: [...optimizedFormats, baseFormat],
        outputDir: path.join('public', imgDir),
        urlPath: imgDir,
        filenameFormat: (hash, _src, width, format) => {
            const suffix = width === ImageWidths.PLACEHOLDER ? 'placeholder' : width;
            return `${imgName}-${hash}-${suffix}.${format}`;
        },
    });

    // Map each unique format (e.g., jpeg, webp) to its smallest and largest images
    const formatSizes = Object.entries(imageMetadata).reduce((formatSizes, [format, images]) => {
        if (!formatSizes[format]) {
            const placeholder = images.find((image) => image.width === ImageWidths.PLACEHOLDER);
            // 11ty sorts the sizes in ascending order under the hood
            const largestVariant = images[images.length - 1];

            formatSizes[format] = {
                placeholder,
                largest: largestVariant,
            };
        }
        return formatSizes;
    }, {});

    const { width, height } = formatSizes[baseFormat].largest;

    const picture = `<picture class="lazy-picture">
    ${Object.values(imageMetadata)
            // Map each format to the source HTML markup
            .map((formatEntries) => {
                // The first entry is representative of all the others since they each have the same shape
                const { format: formatName, sourceType } = formatEntries[0];

                const placeholderSrcset = formatSizes[formatName].placeholder.url;
                const actualSrcset = formatEntries
                    // We don't need the placeholder image in the srcset
                    .filter((image) => image.width !== ImageWidths.PLACEHOLDER)
                    // All non-placeholder images get mapped to their srcset
                    .map((image) => image.srcset)
                    .join(', ');

                return `<source type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${actualSrcset}" data-sizes="${sizes}">`;
            })
            .join('\n')}
    <img
        src="${formatSizes[baseFormat].placeholder.url}"
        data-src="${formatSizes[baseFormat].largest.url}"
        width="${width}"
        height="${height}"
        alt="${alt != undefined ? "alt=" + alt + '"' : ""}"
        class="lazy-img"
        loading="lazy">
    <noscript>
        <img
            src="${formatSizes[baseFormat].largest.url}"
            width="${width}"
            height="${height}"
            alt="${alt != undefined ? "alt=" + alt + '"' : ""}">
    </noscript>
    </picture>`;

    // return outdent`${picture}`;
    return picture;
};

module.exports = function (config) {
    // Date filter (localized)
    config.addNunjucksFilter("date", function (date, format, locale) {
        locale = locale ? locale : "en";
        moment.locale(locale);
        return moment(date).format(format);
    });

    // Collections
    config.addCollection("blogposts_en", function (collection) {
        return collection.getFilteredByGlob("./src/content/en/posts/*.md");
    });

    config.setUseGitIgnore(true);

    config.addWatchTarget('./src/assets/css/tailwind.css');

    config.addPassthroughCopy('./src/assets/');

    config.addPassthroughCopy('./src/robots.txt');
    config.addPassthroughCopy('./src/_redirects');

    config.addShortcode('image', imageShortcode);
    config.addNunjucksAsyncShortcode('image', imageShortcode);

    return {
        passthroughFileCopy: true,
        dir: {
            input: "src",
            output: "public",
        }
    };
}