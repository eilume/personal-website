const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');

// Originally from: https://stackoverflow.com/a/25462405
function getFilteredFiles(startPath, filter, outputList) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            getFilteredFiles(filename, filter, outputList); //recurse
        }
        else if (filename.indexOf(filter) >= 0) {
            outputList.push(filename);
        };
    };
};

let publicJSFiles = [];
let distJSFiles = [];
let htmlFiles = [];
getFilteredFiles("./public/assets/js", ".js", publicJSFiles);
getFilteredFiles("./dist/assets", ".js", distJSFiles);
getFilteredFiles("./dist", ".html", htmlFiles);

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

fs_extra.copySync("./public/content/image/", "./dist/content/image/");

fs.copyFileSync("./public/_redirects", "./dist/_redirects");
fs.copyFileSync("./public/robots.txt", "./dist/robots.txt");
fs.copyFileSync("./public/sitemap.xml", "./dist/sitemap.xml");