const moment = require("moment");
const pluginImage = require('@11ty/eleventy-img');
const path = require("path");

const ImageWidths = {
    ORIGINAL: null,
    PLACEHOLDER: 24,
};

// Originally from: https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/
// Slight edits have been made
const imageShortcode = async (
    lazy,
    src,
    alt,
    fileName,
    urlPath,
    unscaledWidths = [400, 800, 1200, 1600, 2000, 2400],
    scaledWidths = [800, 1200, 1600, 2000, 2400],
    baseFormat = 'jpeg',
    optimizedFormats = ['avif', 'webp'],
    sizes = '100vw'
) => {
    let imgName, imgDir, fullSrc;
    
    if (/https?:\/\//.test(src)) {
        imgName = fileName;
        imgDir = urlPath;
        fullSrc = src;
    }
    else {
        const { name: parsedName, dir: parsedDir } = path.parse(src);
        
        imgName = parsedName;
        imgDir = parsedDir;
        fullSrc = path.join('src', src);
    }

    let sharedWidths = Array.from(new Set(unscaledWidths.concat(scaledWidths)));
    let originalWidth;
    let baseFileHash;

    console.log(`\nStarting to generate images for '${imgName}'...`);

    // Generate unscaled images
    const imageMetadata = await pluginImage(fullSrc, {
        widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...unscaledWidths],
        // widths: [ImageWidths.PLACEHOLDER, ...unscaledWidths],
        formats: [...optimizedFormats, baseFormat],
        outputDir: path.join('public', imgDir),
        urlPath: imgDir,
        filenameFormat: (hash, _src, width, format) => {
            baseFileHash = hash;
            let suffix;
            switch (width) {
                case ImageWidths.PLACEHOLDER:
                    suffix = 'placeholder';
                    break;

                default:
                    let isOriginalWidth = true;
                    for (let i = 0; i < sharedWidths.length; i++) {
                        if (width === sharedWidths[i]) {
                            isOriginalWidth = false;
                            suffix = width;
                        } else {
                            originalWidth = width;
                        }
                    }

                    if (isOriginalWidth) suffix = 'original';
            }

            return `${imgName}-${hash}-${suffix}.${format}`;
        },
    });

    // Generate scaled images with lower quality because of device pixel ratio resulting in super-sampling
    const scaledImageMetadata = await pluginImage(fullSrc, {
        widths: [ImageWidths.ORIGINAL, ...scaledWidths],
        formats: [...optimizedFormats, baseFormat],
        sharpJpegOptions: { quality: 45, }, // options passed to the Sharp jpeg output method
        sharpPngOptions: { quality: 65, }, // options passed to the Sharp png output method
        sharpWebpOptions: { quality: 45 }, // options passed to the Sharp webp output method
        sharpAvifOptions: { quality: 30 }, // options passed to the Sharp avif output method
        outputDir: path.join('public', imgDir),
        urlPath: imgDir,
        filenameFormat: (hash, _src, width, format) => {
            let suffix;
            switch (width) {
                case ImageWidths.PLACEHOLDER:
                    suffix = 'placeholder';
                    break;

                default:
                    let isOriginalWidth = true;
                    for (let i = 0; i < sharedWidths.length; i++) {
                        if (width === sharedWidths[i]) {
                            isOriginalWidth = false;
                            suffix = width;
                        } else {
                            originalWidth = width;
                        }
                    }

                    if (isOriginalWidth) suffix = 'original';
            }

            return `${imgName}-${baseFileHash}-hidpiscaled-${suffix}.${format}`;
        },
    });

    unscaledWidths.push(originalWidth);
    scaledWidths.push(originalWidth);
    sharedWidths.push(originalWidth);

    for (keyIndex in Object.keys(imageMetadata))
    {
        let key = Object.keys(imageMetadata)[keyIndex];

        scaledImageMetadata[key].forEach((value) => {imageMetadata[key].push(value)});
    }

    // Map each unique format (e.g., jpeg, webp) to its smallest and largest images
    const formatSizes = Object.entries(imageMetadata).reduce((formatSizes, [format, images]) => {
        if (!formatSizes[format]) {
            const placeholder = images.find((image) => image.width === ImageWidths.PLACEHOLDER);
            // 11ty sorts the sizes in ascending order under the hood
            const largestVariant = images[images.length - 1];

            originalWidth = largestVariant.width;

            formatSizes[format] = {
                placeholder,
                largest: largestVariant,
            };
        }
        return formatSizes;
    }, {});

    const { width, height } = formatSizes[baseFormat].largest;

    const lazyImg = `<img
        src="${formatSizes[baseFormat].placeholder.url}"
        data-src="${formatSizes[baseFormat].largest.url}"
        width="${width}"
        height="${height}"
        alt="${alt != undefined ? alt : ""}"
        class="lazy-img"
        loading="lazy"
    >`;

    const normalImg = `<img
        src="${formatSizes[baseFormat].largest.url}"
        width="${width}"
        height="${height}"
        alt="${alt != undefined ? alt : ""}"
    >`;

    const picture = `<picture${lazy ? " class=" + '"' + "lazy-picture" + '"' : ""}>
    ${Object.values(imageMetadata)
            // Map each format to the source HTML markup
            .map((formatEntries) => {
                // The first entry is representative of all the others since they each have the same shape
                const { format: formatName, sourceType } = formatEntries[0];

                const placeholderSrcset = formatSizes[formatName].placeholder.url;

                // console.log(formatEntries);

                const unscaledSrcset = formatEntries
                    // We don't need the placeholder image in the srcset
                    // We also only want the normaldpi scaled images
                    .filter((image) => image.width !== ImageWidths.PLACEHOLDER && !image.filename.includes("-hidpiscaled-"))
                    // All non-placeholder images get mapped to their srcset
                    .map((image) => image.srcset)
                    .join(', ');
                
                const scaledSrcset = formatEntries
                    // We don't need the placeholder image in the srcset
                    // We also only want the hidpi scaled images
                    .filter((image) => image.width !== ImageWidths.PLACEHOLDER && image.filename.includes("-hidpiscaled-"))
                    // .filter((image) => image.width !== ImageWidths.PLACEHOLDER && (image.filename.includes("-hidpiscaled-") || image.width >= originalWidth))
                    // All non-placeholder images get mapped to their srcset
                    .map((image) => image.srcset)
                    .join(', ');

                if (lazy) {
                    return `<source media="(-webkit-min-device-pixel-ratio: 1.5)" type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${scaledSrcset}" data-sizes="${sizes}">\n<source type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${unscaledSrcset}" data-sizes="${sizes}">`;
                }
                else {
                    return `<source media="(-webkit-min-device-pixel-ratio: 1.5)" type="${sourceType}" src="${placeholderSrcset}" srcset="${scaledSrcset}" sizes="${sizes}">\n<source type="${sourceType}" src="${placeholderSrcset}" srcset="${unscaledSrcset}" sizes="${sizes}">`;
                }
            })
            .join('\n')}
    ${lazy ? lazyImg + "<noscript>" + normalImg + "</noscript>" : normalImg}
    </picture>`;

    return picture;
};

const highlightShortcode = (
    content,
    lang,
    // showLinesNumbers = false,
    addedLines = undefined,
    removedLines = undefined
) => {
    if (addedLines != undefined) {
        // Shift numbers by 1 to match the 11ty plugin by starting the first line starting at 0
        let split = addedLines.split(', ');
        split.forEach((v, i, a) => { outputArray = v.split('-'); outputArray.forEach((v2, i2, a2) => { v2 = (parseInt(v2) + 1).toString(); a2[i2] = v2; }); a[i] = outputArray.join('-') });
        addedLines = split.join(', ');
    }
    // TODO: add support for removed lines somehow (make a plugin?)
    // return `<pre${showLinesNumbers ? " class=" + '"' + "line-numbers" + '"' : ""}${addedLines != undefined ? " data-line=" + '"' + addedLines + '"' + " data-line-offset=" + '"' + "-1" + '"' : ""}><code class="language-${lang}">${content.replace(/\n/, "")}</code></pre>`;
    return `<pre class="line-numbers language-${lang}"${addedLines != undefined ? " data-line=" + '"' + addedLines + '"' : ""}><code class="language-${lang}">${content.replace(/\n/, "")}</code></pre>`;
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

    config.addWatchTarget("./src/assets/css/tailwind.css");

    config.addPassthroughCopy("./src/assets/");

    config.addPassthroughCopy("./src/robots.txt");
    config.addPassthroughCopy("./src/_redirects");

    config.addShortcode("image", imageShortcode);
    config.addPairedShortcode("highlight", highlightShortcode);

    return {
        passthroughFileCopy: true,
        dir: {
            input: "src",
            output: "public",
        }
    };
}
