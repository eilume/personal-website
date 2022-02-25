// const { createCanvas, loadImage } = require("canvas");
const { Canvas, loadImage } = require("skia-canvas");
const fs = require("fs");
const sharp = require("sharp");
const chalk = require("chalk");
const log = require("../../../log");
const crypto = require("crypto");
const config = require("../../_data/config");

const canvasWidth = 2160;
const canvasHeight = 1080;

const outputImageScale = 0.5;

// const canvas = createCanvas(canvasWidth, canvasHeight, "svg");
const canvas = new Canvas(canvasWidth, canvasHeight, "svg");
const ctx = canvas.getContext("2d");

const logoImagePath = "./src/content/image/logo.png";

const maxContentHeight = 568;

const titleLineHeight = 72;
const descriptionLineHeight = 36;

const logoTitleSpacing = 64;
const titleDescriptionSpacing = 78;

const wrapText = (context, text, x, y, maxWidth, lineHeight, lineSpacing, fill = true) => {
    let words = text.split(" ");
    let line = "";
    let wraps = 0;
    
    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
    
        if (testWidth > maxWidth && n > 0) {
            if (fill) context.fillText(line, x, y);

            line = words[n] + " ";
            y += lineHeight + lineSpacing;
            wraps += 1;
        }
        else {
            line = testLine;
        }
    }
    
    if (fill) context.fillText(line, x, y);

    return (wraps * lineSpacing) + ((wraps + 1) * lineHeight);
}

const generateOpenGraphImage = async (titleText = "", descriptionText = "", outputFile = "", backgroundImagePath = "", imageCreditText = "") => {
    if (titleText == "" || titleText.length < 1)
    {
        log("Page : Open Graph", "err", "Title is missing!");
    }

    let defaultBackground = backgroundImagePath == "";
    
    if (backgroundImagePath == "")
    {
        backgroundImagePath = "./src/content/image/default-open-graph-background.png";
    }

    let backgroundImage = await loadImage(backgroundImagePath);
    let logoImage = await loadImage(logoImagePath);

    if (defaultBackground)
    {
        // Draw background
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    }
    else
    {
        // Source: https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
        let hRatio = canvasWidth / backgroundImage.width;
        let vRatio = canvasHeight / backgroundImage.height;

        let ratio = Math.max(hRatio, vRatio);

        let centerShiftX = ( canvasWidth - backgroundImage.width * ratio) / 2;
        let centerShiftY = ( canvasHeight - backgroundImage.height * ratio) / 2;

        // Darken image
        ctx.filter = "brightness(50%)";
        
        // Draw background using cropped args
        ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, centerShiftX, centerShiftY, backgroundImage.width * ratio, backgroundImage.height * ratio);
        ctx.filter = "none";
    }
    
    ctx.fillStyle = "white";

    // Calculate title text height
    ctx.font = "800 96px Manrope";
    let titleHeightWithSpacing = titleDescriptionSpacing + wrapText(ctx, titleText, 384, titleLineHeight, 1392, titleLineHeight, titleLineHeight * 0.75, false);
    
    // Calculate description text height
    ctx.font = "800 48px Manrope";
    let descriptionHeight = wrapText(ctx, descriptionText, 384, titleHeightWithSpacing + descriptionLineHeight, 1392, descriptionLineHeight, descriptionLineHeight * 0.75, false);
    
    // Calculate logo + title + description total height
    let contentHeight = titleHeightWithSpacing + descriptionHeight + logoImage.height + logoTitleSpacing;

    if (contentHeight > maxContentHeight)
    {
        log("Page : Open Graph", "warn", `Title (${chalk.yellow("very likely")}) or description is too long to fit within safety margins. Clipping may occur!`);
    }
    
    // Shift height to center content
    let yPos = (canvasHeight - contentHeight) / 2;
    
    // Draw logo
    ctx.drawImage(logoImage, 384, yPos, logoImage.width, logoImage.height);
    
    // Offset y-pos
    yPos += logoImage.height + logoTitleSpacing;
    
    // Draw title text
    ctx.font = "800 96px Manrope";
    titleDescriptionSpacing + wrapText(ctx, titleText, 384, yPos + titleLineHeight, 1392, titleLineHeight, titleLineHeight * 0.75);
    
    // Draw description text
    ctx.font = "800 48px Manrope";
    wrapText(ctx, descriptionText, 384, yPos + titleHeightWithSpacing + descriptionLineHeight, 1392, descriptionLineHeight, descriptionLineHeight * 0.75);
    
    if (imageCreditText != "" && config.openGraph.includeImageSource)
    {
        ctx.textAlign = "right";
        
        // Draw image source text
        ctx.font = "700 36px Manrope";
        ctx.fillText(imageCreditText, 1776, 862);
        
        // Prepend text
        ctx.font = "500 36px Manrope";
        ctx.fillText("Image Source: ", 1776 - ctx.measureText(imageCreditText).width - 28, 862);
    }

    // Convert canvas buffer to resized PNG
    sharp(canvas.toBufferSync()).resize(canvasWidth * outputImageScale, canvasHeight * outputImageScale).jpeg({ quality: config.openGraph.jpegQuality }).toFile(`${outputFile}`, (err, info) => {
        if (err) log("Page : Open Graph", "err", err);
    });
}

module.exports = (data) => {
    let coverFileData = data.cover != undefined && data.cover.path != null ? fs.readFileSync(`./src${data.cover.path}`) : "";
    let hash = crypto.createHash("md5").update(data.title + data.description + coverFileData).digest("hex");
    
    const outputFile = `${(data.title != "404" ? data.page.url : data.page.url.replace(".html", "-"))}open-graph-${hash.substring(0, 10)}.jpeg`;

    if (!fs.existsSync(`./public${outputFile}`))
    {   
        let directory = `./public${data.page.url}`;
        // Ensure directory exists
        if (!fs.existsSync(directory) && !directory.includes(".html")) fs.mkdirSync(directory, { recursive: true });

        log("Page : Open Graph", "info", `Generating open graph image for page: '${chalk.green(data.page.inputPath)}'`);
        generateOpenGraphImage(data.title, data.description, `./public${outputFile}`, data.cover != undefined && data.cover.path != null ? `./src${data.cover.path}` : "", data.cover != undefined && data.cover.credit != null ? data.cover.credit : "");
    } else {
        log("Page : Open Graph", "info", `Found up-to-date open graph image for page: '${chalk.green(data.page.inputPath)}'`);
    }
    
    return `<meta property="og:image" content="${data.url}${outputFile}">`;
};