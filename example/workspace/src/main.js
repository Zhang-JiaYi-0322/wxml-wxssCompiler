require('@egret-wxml/runtime');

async function run() {
    const indexFile = await loadText('./miniprogram/pages/index/index.js');
    const cssText = await loadText('./miniprogram/app.wxss.json');
    if (cssText) {
        const css = JSON.parse(cssText);
        initStyle(css);
    }
    eval(indexFile);
}
run();

function initStyle(collections) {
    if (!collections) return;
    const style = document.createElement("style");
    document.head.appendChild(style);
    const sheet = style.sheet;

    for (const collection of collections) {
        const _style = collection.style;
        for (const element of collection.element) {
            let texts = [];
            if (element.insert) {
                texts = styleToString(element, _style, true);
            }
            else {
                texts = styleToString(element, _style, false);
            }
            sheet.addRule(texts[0], texts[1]);
        }
    }
}


function loadText(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            resolve(xhr.responseText);
        };
        xhr.open('get', url);
        xhr.send();
    });
}

function styleToString(element, style, insert) {
    let elementText = "";
    let styleText = "";

    // element
    if (element.type == 'class')
        elementText = '.';
    else if (element.type == 'id')
        elementText = '#';
    else
        elementText = '@';
    elementText += element.name;
    if (element.type !== 'else' && insert)
        elementText += '::' + element.position;

    // style
    for (const key in style) {
        styleText += key + ': ' + style[key] + ';';
    }
    const buffer = styleText.split('');
    buffer.pop();
    styleText = buffer.join("");

    return [elementText, styleText];
}