const fs = require('fs');
const path = require('path');

const inputFilePath = "./build/vite.config.template.js";
const outputFilePath = "./vite.config.js";

const replaceSubstring = "_REPLACE_";
const replaceString = "input: {_REPLACE_}";

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

let file = fs.readFileSync(inputFilePath, 'utf-8');

// let filePaths = "main: resolve(__dirname, 'public/en/index.html')";
let filePaths = [];
getFilteredFiles("./public", ".html", filePaths);

let outputString = "";
for (let i = 0; i < filePaths.length; i++) {
    let key = filePaths[i].replace(/[\/-]/g, "_").replace("_index.html", "");
    let value = "resolve(__dirname, '" + filePaths[i];
    outputString += key + ": " + value + "'), ";
}

let replaceValue = replaceString.replace(replaceSubstring, " " + outputString + " ");

// Replace in-memory file
file = file.replace(replaceString.replace(replaceSubstring, ""), replaceValue);

// Re-write file
fs.writeFileSync(outputFilePath, file, "utf-8");
