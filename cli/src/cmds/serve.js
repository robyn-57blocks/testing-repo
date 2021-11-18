"use strict";

const chalk = require("chalk");
const { bundle,  } = require("../../build");
const path = require("path");

const __processDir = process.env.PWD || process.cwd();

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir).replace(/\\/g, "/");
}

try {
    require("dotenv").config({
        path: normalizeAdUnitPath(".env")
    });
} catch (x) {}//eslint-disable-line

const command = "serve";
const desc = "Serve ad unit in development mode";

const builder = {
    env: {
        alias: "e",
        describe: "environment",
        type: "string",
        default: "development",
        choices: ["development", "production", "testing"],
    },
    flex: {
        alias: "f",
        describe: "FlexFeed",
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
    debug: {
        alias: "d",
        describe: "Debug",
        type: "boolean",
        default: false,
        choices: [true, false],
    }
};

const handler = ({ env, flex, omsdk, debug }) => {
    process.env.NODE_ENV = env;
    process.env.FLEX_FEED = flex;
    process.env.DEV_PORT = process.env.DEV_PORT || 9090;
    process.env.DEV_PORT_UI = process.env.DEV_PORT_UI || 9091;
    process.env.NODE_DEBUG = debug;
    process.env.NODE_OMSDK = omsdk;
    process.env.I18N_CDN = "/data/i18n.js";
    process.env.NODE_COMMAND = "serve";
    process.env.DEV_OPEN = (typeof process.env.DEV_OPEN !== "undefined" && process.env.DEV_OPEN ? process.env.DEV_OPEN : "true") === "true";

    console.log(`${chalk.bold.cyan("[SERVE]")}: ...`); //eslint-disable-line

    (async function () {
        await bundle();
    })();
};

module.exports = { command, desc, builder, handler };
