"use strict";

const { clean } = require("../../build");
const chalk = require("chalk");

const command = "clean";
const desc = "Clean dist or/and release";
const builder = {};

const handler = () => {
    (async function () {
        console.log(`${chalk.bold.cyan("[CLEAN]")}: dist and release`); //eslint-disable-line
        await Promise.all([clean("dist"), clean("release")]);
        console.log(`${chalk.bold.green("[CLEAN:SUCCESS]")}: dist and release were removed.`); //eslint-disable-line
    })();
};

module.exports = { command, desc, builder, handler };
