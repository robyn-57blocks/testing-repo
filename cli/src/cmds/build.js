"use strict";

const { build } = require("../../build");
const chalk = require("chalk");
const config = require("../../build/config.js");

const command = "build";
const desc = "Build ad unit for production";
const builder = {
    debug: {
        alias: "d",
        describe: "Debug",
        type: "boolean",
        default: false,
        choices: [true, false],
    },
    omsdk: {
        alias: "o",
        describe: "OMSDK included",
        type: "boolean",
        default: false,
        choices: [true, false],
    },
    env: {
        alias: "e",
        describe: "environment",
        type: "string",
        default: "production",
        choices: ["development", "production", "testing"],
    },
};

const handler = ({ debug, omsdk, env }) => {
    process.env.NODE_ENV = env;
    process.env.NODE_DEBUG = debug;
    process.env.NODE_OMSDK = omsdk;
    process.env.I18N_CDN = process.env.I18N_CDN || config.i18nCDN;

    console.log(`${chalk.bold.cyan("[BUILD]")}: ...`); //eslint-disable-line
    (async function () {
        try {
            await build();
            console.log(`${chalk.bold.green("[BUILD:SUCCESS]")}`); //eslint-disable-line
        } catch (x) {
            console.log(`${chalk.bold.red("[BUILD:FAIL]")}`); //eslint-disable-line
            console.log(x) //eslint-disable-line
            return process.exit(1);
        }
    })();
};

module.exports = { command, desc, builder, handler };
