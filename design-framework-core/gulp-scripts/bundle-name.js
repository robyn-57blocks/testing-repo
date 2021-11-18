const fs = require('fs-extra');
const pascalCase = require('pascal-case');

const config = require('./config.js');

let bundleNameTemplate = `Vungle_%APPNAME%_%LANG%_%DATE%_PIEC_%LABELS%.zip`;

module.exports.getBundleName = function() {

    var date = new Date();
    var day = ("0" + date.getDate()).slice(-2);
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var year = ("0" + date.getYear()).slice(-2);

    let srcPjson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    var appName = 'VUNGLE';
    var labels = 'TIMER'; //todo implement
    var lang = 'EN'; //todo implement

    return bundleNameTemplate
        .replace('%APPNAME%', pascalCase(appName))
        .replace('%LANG%', lang)
        .replace('%DATE%', year + month + day)
        .replace('%LABELS%', 'NOTIMER');
}