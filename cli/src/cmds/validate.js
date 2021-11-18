"use strict";
const chalk = require("chalk");
const { validate } = require("../../build");
const command = "validate";
const desc = "Validate ad unit config";
const builder = {};

const handler = async () => {
    console.log(`${chalk.bold.cyan("[VALIDATE]")}: ...`); //eslint-disable-line

    try {
        await validate();
        console.log(`${chalk.bold.green("[VALIDATE:SUCCESS]")}: ...`);  //eslint-disable-line
    } catch (x) {
        console.error(`${chalk.bold.red("[VALIDATE:FAIL]")}:`); //eslint-disable-line
        console.error(x); //eslint-disable-line
        return process.exit(1);
    }
};

module.exports = { command, desc, builder, handler };
