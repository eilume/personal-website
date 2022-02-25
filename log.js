const chalk = require("chalk");

const log = (category, type, msg) => {
    switch (type) {
        case "info":
            type = chalk.green("Info:");
            break;
        case "warning":
        case "warn":
            type = chalk.yellow.bold("Warning:");
            break;
        case "error":
        case "err":
            type = chalk.red.bold("Error:");
            break;
        default:
            break;
    }

    console.log(`[${chalk.blue(category)}] ${type} ${msg}`);
}

module.exports = log;