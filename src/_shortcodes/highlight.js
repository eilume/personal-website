const highlightShortcode = (
    content,
    lang,
    // showLinesNumbers = false,
    addedLines = undefined,
    removedLines = undefined
) => {
    // if (addedLines != undefined) {
    //     // Shift numbers by 1 to match the 11ty plugin by starting the first line starting at 0
    //     let split = addedLines.split(', ');
    //     split.forEach((v, i, a) => { outputArray = v.split('-'); outputArray.forEach((v2, i2, a2) => { v2 = (parseInt(v2) + 1).toString(); a2[i2] = v2; }); a[i] = outputArray.join('-') });
    //     addedLines = split.join(', ');
    // }
    // TODO: add support for removed lines somehow (make a plugin?)
    // return `<pre${showLinesNumbers ? " class=" + '"' + "line-numbers" + '"' : ""}${addedLines != undefined ? " data-line=" + '"' + addedLines + '"' + " data-line-offset=" + '"' + "-1" + '"' : ""}><code class="language-${lang}">${content.replace(/\n/, "")}</code></pre>`;
    return `<pre class="line-numbers language-${lang}"${addedLines != undefined ? " data-line=" + '"' + addedLines + '"' : ""}><code class="language-${lang}">${content.replace(/\n/, "")}</code></pre>`;
};

module.exports = highlightShortcode;