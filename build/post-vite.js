const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');

// Originally from: https://stackoverflow.com/a/25462405
function getFilteredFilesFilter(startPath, filter, outputList) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            getFilteredFilesFilter(filename, filter, outputList); //recurse
        }
        else if (filename.indexOf(filter) >= 0) {
            outputList.push(filename);
        };
    };
};

function getFilteredFilesRegex(startPath, regex, outputList) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            getFilteredFilesRegex(filename, regex, outputList); //recurse
        }
        else {
            var matches = filename.match(regex);
            if (matches != null && matches.length == 1) {
                outputList.push(filename);
            }
        };
    };
};

let htmlFiles = [];
getFilteredFilesFilter("./dist", ".html", htmlFiles);

let publicCSSFiles = [];
let distCSSFiles = [];
getFilteredFilesFilter("./public/assets/css", ".css", publicCSSFiles);
getFilteredFilesFilter("./dist/assets", ".css", distCSSFiles);

for (let h = 0; h < htmlFiles.length; h++) {
    let htmlFile = fs.readFileSync(htmlFiles[h], "utf-8").toString();
    let updatedFile = false;

    for (let pc = 0; pc < publicCSSFiles.length; pc++) {
        let publicCSSFilePath = publicCSSFiles[pc].replace("public/", "");
        let publicCSSFileName = path.basename(publicCSSFiles[pc]).replace(".css", "");

        let distCSSFilePath = "";

        for (let dc = 0; dc < distCSSFiles.length; dc++) {
            if (path.basename(distCSSFiles[dc]).includes(publicCSSFileName)) {
                distCSSFilePath = distCSSFiles[dc].replace("dist/", "");
                break;
            }
        }

        if (distCSSFilePath != "") {
            let pathRegex = new RegExp("\/", "g");
            let fileRegex = new RegExp("(" + publicCSSFilePath.replace(pathRegex, "\\/") + ")", "g");

            htmlFile = htmlFile.replace(fileRegex, distCSSFilePath);

            updatedFile = true;
        }
    }

    if (updatedFile) {
        fs.writeFileSync(htmlFiles[h], htmlFile, "utf-8");
    }
}

let publicJSFiles = [];
let distJSFiles = [];
getFilteredFilesFilter("./public/assets/js", ".js", publicJSFiles);
getFilteredFilesFilter("./dist/assets", ".js", distJSFiles);

for (let h = 0; h < htmlFiles.length; h++) {
    let htmlFile = fs.readFileSync(htmlFiles[h], "utf-8").toString();
    let updatedFile = false;

    for (let pj = 0; pj < publicJSFiles.length; pj++) {
        let publicJSFilePath = publicJSFiles[pj].replace("public/", "");
        let publicJSFileName = path.basename(publicJSFiles[pj]).replace(".js", "");

        let distJSFilePath = "";

        for (let dj = 0; dj < distJSFiles.length; dj++) {
            if (path.basename(distJSFiles[dj]).includes(publicJSFileName)) {
                distJSFilePath = distJSFiles[dj].replace("dist/", "");
                break;
            }
        }

        if (distJSFilePath != "") {
            let pathRegex = new RegExp("\/", "g");
            let fileRegex = new RegExp("(" + publicJSFilePath.replace(pathRegex, "\\/") + ")", "g");

            htmlFile = htmlFile.replace(fileRegex, distJSFilePath);

            updatedFile = true;
        }
    }

    if (updatedFile) {
        fs.writeFileSync(htmlFiles[h], htmlFile, "utf-8");
    }
}

let openGraphImageFiles = [];
getFilteredFilesRegex("./public", /open-graph-[a-zA-Z0-9]+.jpeg/gm, openGraphImageFiles);

for (let i = 0 ; i < openGraphImageFiles.length; i++)
{
    fs.copyFileSync(`./${openGraphImageFiles[i]}`, `./${openGraphImageFiles[i].replace("public/", "dist/")}`);
}

fs_extra.copySync("./public/content/image/", "./dist/content/image/");

fs.copyFileSync("./public/_redirects", "./dist/_redirects");
fs.copyFileSync("./public/robots.txt", "./dist/robots.txt");
fs.copyFileSync("./public/sitemap.xml", "./dist/sitemap.xml");