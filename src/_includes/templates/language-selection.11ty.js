const { capitalizeAll } = require("../../_filters");
const chalk = require("chalk");

module.exports = (lang) => {
    let targetUrl = lang.page.url.replace(`/${lang.page.url.match(/[a-zA-Z]+/)[0]}`, `/${lang.code}`);
    
    return `<li><a href="${targetUrl}" class="text-main-dark dark:text-main-light">${capitalizeAll(lang.label)}</a></li>`;
};