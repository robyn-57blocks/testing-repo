"use strict";

// split this into bundle and deploy

const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const { WebClient } = require("@slack/client");
const { execSync } = require("child_process");
const config = require("../../build/config.js");
const { bestZip, build } = require("../../build");
const __processDir = process.env.PWD || process.cwd();

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir);
}

try {
    require("dotenv").config({
        path: normalizeAdUnitPath(".env")
    });
} catch (x) {}//eslint-disable-line


const command = "bundle";
const desc = "Create a new version of bundle and push to slack.";
const builder = {
    omsdk: {
        alias: "o",
        describe: "OMSDK included",
        type: "boolean",
        default: false,
        choices: [true, false],
    },
};

async function slackMessage(tag, vungleConfig) {
  console.log(`${chalk.bold.cyan("[SLACK]")}: ...`); //eslint-disable-line
    const branchName = execSync("git branch | sed -n '/\* /s///p'").toString().trim(); //eslint-disable-line

    const web = new WebClient(config.slackToken);
    return Promise.all(vungleConfig.slack.map((tpl_entry) => {
        return new Promise((resolve) => {
            (async function () {
                const zip_file = tpl_entry.zip;

                if (!fs.pathExistsSync(normalizeAdUnitPath(`${config.releaseDir}/${zip_file}`))) {
                    console.log(`${chalk.yellow("[SLACK:WARNING]")}: Woops! No zip file found: ${zip_file}`); //eslint-disable-line
                    return resolve(new Error(`Woops! No zip file found: ${zip_file}`));
                }

                const template_name = tpl_entry.name;

                try {
                    console.log(`${chalk.cyan("[SLACK:SEND]")}: ${template_name}.`); //eslint-disable-line
                    const filename = `${tag}-${zip_file}`;
                    const entryBundleDir = `${config.bundlesDir}/${template_name}`;
                    const entryTmpDir = `${config.tmpDir}/${template_name}`;

                    await fs.removeSync(normalizeAdUnitPath(entryBundleDir));
                    await fs.removeSync(normalizeAdUnitPath(entryTmpDir));
                    await fs.ensureDirSync(normalizeAdUnitPath(entryBundleDir));
                    await fs.ensureDirSync(normalizeAdUnitPath(entryTmpDir));

                    await fs.copyFileSync(
                        normalizeAdUnitPath(`${config.releaseDir}/${zip_file}`),
                        normalizeAdUnitPath(`${entryBundleDir}/${zip_file}`)
                    );

                    await fs.copyFileSync(
                        normalizeAdUnitPath("CHANGELOG.md"),
                        normalizeAdUnitPath(`${entryBundleDir}/CHANGELOG.md`)
                    );

                    await bestZip(
                        normalizeAdUnitPath(`${entryBundleDir}`),
                        normalizeAdUnitPath(`${entryTmpDir}/${filename}`)
                    );

                    const slackConversationIds = process.env.SLACK_CONVERSATION_IDS.trim().split(",");
                    const initialMsg = generateSlackMessage(
                        template_name,
                        tag,
                        branchName,
                    );

                    await Promise.all(slackConversationIds.map(async (conversationId) => {
                        return web.files.upload({
                            filename: filename,
                            file: fs.createReadStream(normalizeAdUnitPath(`${entryTmpDir}/${filename}`)),
                            channels: conversationId,
                            initial_comment: initialMsg
                        });
                    }));

                    console.log(`${chalk.green("[SLACK:SUCCESS]")}: ${template_name}`); //eslint-disable-line

                    resolve("success");
                } catch (x) {
                  console.log(`${chalk.red("[SLACK:FAILED]")}: ${zip_file}`); //eslint-disable-line
                  console.log(x) //eslint-disable-line

                    resolve(x);
                }
            })();
        });
    }));
}

async function clean() {
    await fs.removeSync(normalizeAdUnitPath(config.bundlesDir));
    await fs.removeSync(normalizeAdUnitPath(config.tmpDir));
    await fs.removeSync(normalizeAdUnitPath("CHANGELOG.md"));
}

function generateSlackMessage(name, tag, branchName) {
    return `Hello everyone :heartbeat: 🦄 :bananaman: :fonzie: :borat:.\n \nIt is me, your trusted Dynamic Templates :robot_face:.\nWe are publishing a new bundle for template *${name}*.\n*Version:*\n\`v${tag}\`\n\n*Branch:*\n\`${branchName}\`\n \n*CHANGELOG* with *Bundle ZIP* (Download and Extract):`;
}

const handler = ({ omsdk }) => {
    console.log(`${chalk.bold.cyan("[BUNDLE]")}: ...`); //eslint-disable-line

    if (!process.env.SLACK_CONVERSATION_IDS) {
      console.log(`${chalk.yellow("[SLACK:WARNING]")}: SLACK_CONVERSATION_IDS env variable not provided.`); //eslint-disable-line
        return process.exit(1);
    }

    let vungleConfig = null;

    process.env.NODE_ENV = "production";
    process.env.I18N_CDN = process.env.I18N_CDN || config.i18nCDN;
    process.env.NODE_OMSDK = omsdk;

    try {
        vungleConfig = require(normalizeAdUnitPath(config.vungleConfigFilename));
    } catch (x) {
        console.error(`${chalk.bgRed("[FAILED]")}: Entered ad unit is missing ${chalk.magenta(config.vungleConfigFilename)} file.`); //eslint-disable-line
        return process.exit(1);
    }

    if (!vungleConfig.slack) {
        console.error(`${chalk.bgRed("[FAILED]")}: Entered ad unit does not have bundle permissions in ${chalk.magenta(config.vungleConfigFilename)} file.`); //eslint-disable-line
        return process.exit(1);
    }

    (async function () {
        try {
            // Tag git repo
            let tag = require(normalizeAdUnitPath("package.json")).version;

            const changelog = require("@puppeteer701vungle/auto-changelog");
            await changelog.generate(); // generate CHANGELOG.md

            // Build bundle
            console.log(`${chalk.cyan("[BUILD]")}: ...`); //eslint-disable-line
            await build();
            console.log(`${chalk.green("[BUILD:SUCCESS]")}.`); //eslint-disable-line

            // Upload bundle to slack
            await slackMessage(tag, vungleConfig);

            await clean();

            console.log(`${chalk.bold.green("[BUNDLE:SUCCESS]")}`); //eslint-disable-line
        } catch (x) {
            await clean();

            console.log(`${chalk.bold.red("[BUNDLE:FAIL]")}`); //eslint-disable-line
            console.log(x) //eslint-disable-line

            return process.exit(1);
        }
    })();
};

module.exports = { command, desc, builder, handler };
