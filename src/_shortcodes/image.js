const pluginImage = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const log = require("../../log");
const config = require("../_data/config");

const ImageWidths = {
    ORIGINAL: null,
    PLACEHOLDER: 24,
};

// TODO: add toggle for hi-dpi images
// TODO: do more testing on hi-dpi scaling (uses around double file size still and kinda looks worse?)
// TODO: add image cropping (keep 2:1, crop to center)
// TODO: add image caption (barebones done)
// TODO: add image credit (barebones done)
// TODO: add basic template system (to auto generate overlay for open graph)
// TODO: add watermark/overlay options
// TODO: add portfolio-like click on image to view larger + hover to zoom
// TODO: add option to view original whilst view is focused on image (instead of
//       auto-streaming the image, its much better for bandwidth + firefox can't
//       handle it to well as other browsers with really large images combined with
//       css filters it seems)

// Originally from: https://www.aleksandrhovhannisyan.com/blog/eleventy-image-lazy-loading/
// Some edits have been made + features added
const imageShortcode = async (
    lazy,
    src,
    alt = "",
    caption = "",
    credit = "",
    creditUrl = "",
    fileName = "",
    urlPath = "",
    unscaledWidths = [400, 800, 1200, 1600, 2000, 2400],
    scaledWidths = [800, 1200, 1600, 2000, 2400, 3600],
    baseFormat = 'jpeg',
    optimizedFormats = ['avif', 'webp'],
    sizes = '100vw'
) => {
    let imgName, imgDir, fullSrc;
    
    if (/https?:\/\//.test(src)) {
        // URL file
        imgName = fileName;
        imgDir = urlPath;
        fullSrc = src;
    }
    else {
        // Local file
        const { name: parsedName, dir: parsedDir } = path.parse(src);
        
        imgName = parsedName;
        imgDir = parsedDir;
        fullSrc = path.join('src', src);

        // Ensure file exists
        try {
            if (!fs.existsSync(fullSrc))
            {
                // File doesn't exist
                return `<p style="color: red">Image path doesn't exist!</p>`;
            }
        } catch (err) {
            console.error(err);
            
            return err;
        }
    }

    let sharedWidths;
    if (config.imageShortcode.includeHiDpi)
    {
        sharedWidths = Array.from(new Set(unscaledWidths.concat(scaledWidths)));
    } else {
        sharedWidths = Array.from(new Set(unscaledWidths));
    }
    let originalWidth;
    let baseFileHash;

    log("Shortcode : Image", "info", `Generating images for '${chalk.green(imgName)}'`);

    // Generate unscaled images
    const imageMetadata = await pluginImage(fullSrc, {
        // widths: [ImageWidths.ORIGINAL, ImageWidths.PLACEHOLDER, ...unscaledWidths],
        widths: [ImageWidths.PLACEHOLDER, ...unscaledWidths],
        // widths: [ImageWidths.PLACEHOLDER, ...unscaledWidths],
        formats: [...optimizedFormats, baseFormat],
        sharpJpegOptions: { quality: 85, }, // options passed to the Sharp jpeg output method
        sharpPngOptions: { quality: 75, }, // options passed to the Sharp png output method
        sharpWebpOptions: { quality: 60 }, // options passed to the Sharp webp output method
        sharpAvifOptions: { quality: 60 }, // options passed to the Sharp avif output method
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

    if (config.imageShortcode.includeHiDpi)
    {
        // Generate scaled images with lower quality because of device pixel ratio resulting in super-sampling
        const scaledImageMetadata = await pluginImage(fullSrc, {
            // widths: [ImageWidths.ORIGINAL, ...scaledWidths],
            widths: [...scaledWidths],
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
    }

    unscaledWidths.push(originalWidth);
    sharedWidths.push(originalWidth);
    
    if (config.imageShortcode.includeHiDpi)
    {
        scaledWidths.push(originalWidth);

        // Add `scaledImageMetadata` to shared `imageMetadata`
        for (keyIndex in Object.keys(imageMetadata))
        {
            let key = Object.keys(imageMetadata)[keyIndex];

            scaledImageMetadata[key].forEach((value) => {imageMetadata[key].push(value)});
        }
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
        height="${height}" ${alt != "" ? "alt=" + '"' + alt + '"' + ' ' : ""}
        class="w-full lazy-img require-js"
        loading="lazy">`;

    const normalImg = `<img
        src="${formatSizes[baseFormat].largest.url}"
        width="${width}"
        height="${height}"${alt != "" ? " alt=" + '"' + alt + '"' : ""}>`;

    let picture = `<picture class="w-full${lazy ? " lazy-picture" : ""}">
    ${Object.values(imageMetadata)
            // Map each format to the source HTML markup
            .map((formatEntries) => {
                // The first entry is representative of all the others since they each have the same shape
                const { format: formatName, sourceType } = formatEntries[0];

                const placeholderSrcset = formatSizes[formatName].placeholder.url;

                const unscaledSrcset = formatEntries
                    // We don't need the placeholder image in the srcset
                    // We also only want the normaldpi scaled images
                    .filter((image) => image.width !== ImageWidths.PLACEHOLDER && !image.filename.includes("-hidpiscaled-"))
                    // All non-placeholder images get mapped to their srcset
                    .map((image) => image.srcset)
                    .join(', ');
                
                if (config.imageShortcode.includeHiDpi)
                {
                    let scaledSrcset = formatEntries
                    // We don't need the placeholder image in the srcset
                    // We also only want the hidpi scaled images
                    .filter((image) => image.width !== ImageWidths.PLACEHOLDER && image.filename.includes("-hidpiscaled-"))
                    // .filter((image) => image.width !== ImageWidths.PLACEHOLDER && (image.filename.includes("-hidpiscaled-") || image.width >= originalWidth))
                    // All non-placeholder images get mapped to their srcset
                    .map((image) => image.srcset)
                    .join(', ');
                    
                    // Replace hidpi scaled original with normal, better quality original
                    // scaledSrcset = scaledSrcset.replace("-hidpiscaled-original", "-original");
                    
                    if (lazy) {
                        return `<source media="(-webkit-min-device-pixel-ratio: 1.5)" type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${scaledSrcset}" data-sizes="${sizes}">\n<source type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${unscaledSrcset}" data-sizes="${sizes}">`;
                    }
                    else {
                        return `<source media="(-webkit-min-device-pixel-ratio: 1.5)" type="${sourceType}" src="${placeholderSrcset}" srcset="${scaledSrcset}" sizes="${sizes}">\n<source type="${sourceType}" src="${placeholderSrcset}" srcset="${unscaledSrcset}" sizes="${sizes}">`;
                    }
                }
                else {
                    if (lazy) {
                        return `<source type="${sourceType}" srcset="${placeholderSrcset}" data-srcset="${unscaledSrcset}" data-sizes="${sizes}">`;
                    }
                    else {
                        return `<source type="${sourceType}" src="${placeholderSrcset}" srcset="${unscaledSrcset}" sizes="${sizes}">`;
                    }
                }
            })
            .join('\n')}
    ${lazy ? lazyImg + "<noscript>" + normalImg + "</noscript>" : normalImg}
    </picture>`;
    
    if (credit != "")
    {
        picture += `<div class="absolute bottom-0 right-0 p-4 bg-main-dark bg-opacity-75 backdrop-blur-lg w-full sm:w-fit rounded-br-2xl rounded-bl-2xl sm:rounded-bl-none sm:rounded-tl-2xl">`;
        
        if (creditUrl != "")
        {
            // Add clickable credit
            picture += `\n<a class="mx-auto sm:ml-auto flex text-main-light w-fit" href="${creditUrl}"><p class="font-medium">Image Source:&nbsp;<p class="font-bold">${credit}</p></p></a>`;
        } else {
            // Add credit
            picture += `\n<p class="ml-auto text-main-light font-medium">${credit}</p>`;
        }

        picture += "</div>";
    }

    captionElement = "";
    if (caption != "")
    {
        // Add caption
        captionElement = `\n<p class="mt-4 text-center">${caption}</p>`;
    }

    return `<div><div class="image relative">${picture}</div>${captionElement}</div>`;
};

module.exports = imageShortcode;