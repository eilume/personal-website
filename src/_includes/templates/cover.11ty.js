const { imageShortcode } = require("../../_shortcodes");
const chalk = require("chalk");

module.exports = (cover) => {
    // TODO: generate open-graph specific images too
    if (cover.path != undefined)
    {
        console.log(`[${chalk.yellow.bold("Cover")}] ${chalk.bgRedBright.bold("TODO:")} add photo credit somewhere: ${cover.credit}`);
        return imageShortcode(false, cover.path, cover.alt != undefined ? cover.alt : "");
    }
};