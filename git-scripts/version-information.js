const fs = require('fs-extra')
const pkg = require('../package.json');

createVersionFile();

async function createVersionFile() {
    var obj = {
        version: pkg.version
    }
    fs.writeJsonSync(`./s3/version-info.json`, obj)
}