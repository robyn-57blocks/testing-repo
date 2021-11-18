"use strict";
const jsdoc2md = require("jsdoc-to-markdown");
const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");

const command = "docs";
const desc = "Generate JSDocs";
const builder = {};

const __processDir = process.env.PWD || process.cwd();

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir);
}

const handler = async () => {
    console.log(`${chalk.bold.cyan("[DOCS]")}: ...`); //eslint-disable-line
    const docs = jsdoc2md.renderSync({ files: normalizeAdUnitPath("src/**/*.js") });
    await fs.outputFile(normalizeAdUnitPath("./docs/jsdocs/README.md"), docs);
    console.log(`${chalk.bold.green("[DOCS:SUCCESS]")}: JS Docs Generated. Check ${chalk.cyan("./docs/jsdocs/")} directory.`); //eslint-disable-line
};

module.exports = { command, desc, builder, handler };
