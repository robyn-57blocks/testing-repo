"use strict";

const { uploadToS3, build, bestZip } = require("../../build");
const config = require("../../build/config.js");
const { WebClient } = require("@slack/client");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const __processDir = process.env.PWD || process.cwd();

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir);
}

const chalk = require("chalk");
const command = "upload";
const desc = "Upload bundle to AWS S3 (Only applicable for programmatic templates)";
const builder = {
    debug: {
        alias: "d",
        describe: "Debug",
        type: "boolean",
        default: false,
        choices: [true, false],
    },
    force: {
        alias: "f",
        describe: "Run command even if [UPLOAD] not present in commit message",
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
        default: "development",
        choices: ["development", "production", "testing", "auto"],
    },
    message: {
        alias: "m",
        describe: "Slack message",
        type: "boolean",
        default: true,
        choices: [true, false],
    },
};

function verifyEnvironmentVariables(env) {
    switch (env) {
    case "development":
        if (!process.env.DEV_AWS_KEY) {
            throw new Error("env.DEV_AWS_KEY missing");
        }
        if (!process.env.DEV_AWS_SECRET) {
            throw new Error("env.DEV_AWS_SECRET missing");
        }
        if (!process.env.DEV_AWS_BUCKET) {
            throw new Error("env.DEV_AWS_BUCKET missing");
        }
        // if (!process.env.DEV_AWS_REGION) {
        //     throw new Error("env.DEV_AWS_REGION missing");
        // }
        if (!process.env.DEV_AWS_FOLDER) {
            throw new Error("env.DEV_AWS_FOLDER missing");
        }
        if (!process.env.DEV_AWS_ENDPOINT) {
            throw new Error("env.DEV_AWS_ENDPOINT missing");
        }
        break;
    case "testing":
        if (!process.env.QA_AWS_KEY) {
            throw new Error("env.QA_AWS_KEY missing");
        }
        if (!process.env.QA_AWS_SECRET) {
            throw new Error("env.QA_AWS_SECRET missing");
        }
        if (!process.env.QA_AWS_BUCKET) {
            throw new Error("env.QA_AWS_BUCKET missing");
        }
        // if (!process.env.QA_AWS_REGION) {
        //     throw new Error("env.QA_AWS_REGION missing");
        // }
        if (!process.env.QA_AWS_FOLDER) {
            throw new Error("env.QA_AWS_FOLDER missing");
        }
        break;
    case "production":
        if (!process.env.PROD_AWS_KEY) {
            throw new Error("env.PROD_AWS_KEY missing");
        }
        if (!process.env.PROD_AWS_SECRET) {
            throw new Error("env.PROD_AWS_SECRET missing");
        }
        if (!process.env.PROD_AWS_BUCKET) {
            throw new Error("env.PROD_AWS_BUCKET missing");
        }
        // if (!process.env.PROD_AWS_REGION) {
        //     throw new Error("env.PROD_AWS_REGION missing");
        // }
        if (!process.env.PROD_AWS_FOLDER) {
            throw new Error("env.PROD_AWS_FOLDER missing");
        }
        break;
    }
    return true;
}

function getEnv(env) {
    let auth = {};

    switch (env) {
    case "development":
        auth = {
            accessKeyId: process.env.DEV_AWS_KEY,
            secretAccessKey: process.env.DEV_AWS_SECRET,
            // region: process.env.DEV_AWS_REGION,
        };

        if (process.env.DEV_AWS_ENDPOINT) {
            auth = Object.assign(auth, {
                endpoint: process.env.DEV_AWS_ENDPOINT,
                s3ForcePathStyle: true, // needed with minio?
                signatureVersion: "v4"
            });
        }
        return {
            auth: auth,
            bucket: process.env.DEV_AWS_BUCKET,
            folder: process.env.DEV_AWS_FOLDER
        };
    case "testing":
        return {
            auth: {
                accessKeyId: process.env.QA_AWS_KEY,
                secretAccessKey: process.env.QA_AWS_SECRET,
                // region: process.env.QA_AWS_REGION
            },
            bucket: process.env.QA_AWS_BUCKET,
            folder: process.env.QA_AWS_FOLDER
        };
    case "production":
        return {
            auth: {
                accessKeyId: process.env.PROD_AWS_KEY,
                secretAccessKey: process.env.PROD_AWS_SECRET,
                // region: process.env.PROD_AWS_REGION
            },
            bucket: process.env.PROD_AWS_BUCKET,
            folder: process.env.PROD_AWS_FOLDER
        };
    }
}

async function clean() {
    await fs.removeSync(normalizeAdUnitPath(config.bundlesDir));
    await fs.removeSync(normalizeAdUnitPath(config.tmpDir));
    await fs.removeSync(normalizeAdUnitPath("CHANGELOG.md"));
}

const handler = ({ debug, env, message, omsdk, force }) => {
  console.log(`${chalk.bold.cyan("[UPLOAD]")}: ...`); //eslint-disable-line

    const commitMsg = execSync("git log -1 --pretty=%B").toString().trim();
    if (!commitMsg.match(/\[UPLOAD]/i) && !force) {
      console.log(`${chalk.bold.yellow("[UPLOAD:WARNING]")}: Skip uploading, because [UPLOAD] is not present in commit.`); //eslint-disable-line
        return process.exit(0);
    }

    let vungleConfig = null;

    process.env.NODE_ENV = "production";
    process.env.NODE_DEBUG = debug;
    process.env.I18N_CDN = process.env.I18N_CDN || config.i18nCDN;
    process.env.NODE_OMSDK = omsdk;

    if (env === "auto") {
        const branchName = execSync("git branch | sed -n '/\* /s///p'").toString().trim(); //eslint-disable-line
        if (!branchName.match(/release\/(.*)/i) && branchName !== "master" && branchName !== "develop") {
          console.log(`${chalk.bold.red("[PUSH:FAIL]")}: Only run this command on release, develop or master branch when env is set to auto.`); //eslint-disable-line
            return process.exit(1);
        }

        if (branchName.match(/release\/(.*)/i)) {
            env = "testing";
        } else if (branchName === "master") {
            env = "production";
        } else {
            env = "development";
        }
    }

    try {
        verifyEnvironmentVariables(env);
    } catch (x) {
      console.error(`${chalk.bold.red("[UPLOAD:AWS:FAIL]")}: Environment variables are not set.\n${x}`); //eslint-disable-line
        return process.exit(1);
    }

    try {
        vungleConfig = require(normalizeAdUnitPath(config.vungleConfigFilename));

        if (!vungleConfig.aws) {
            console.error(`${chalk.bgRed("[FAILED]")}: Entered ad unit does not have upload permissions in ${chalk.magenta(config.vungleConfigFilename)} file.`); //eslint-disable-line
            return process.exit(1);
        }
    } catch (x) {
        console.error(`${chalk.bgRed("[FAILED]")}: Entered ad unit is missing ${chalk.magenta(config.vungleConfigFilename)} file.`); //eslint-disable-line
        return process.exit(1);
    }


    const tag = require(normalizeAdUnitPath("package.json")).version;
    const awsObj = getEnv(env);

    console.log(`${chalk.bold.cyan("[UPLOAD:AWS]")}: ...`); //eslint-disable-line

    (async function () {
        try {
            const changelog = require("@puppeteer701vungle/auto-changelog");
            await changelog.generate(); // generate CHANGELOG.md

            const results = await Promise.all(vungleConfig.aws.map((entry) => {
                return new Promise((resolve) => {
                    (async function () {
                        try {
                            const uploadEnv = entry.upload || ["development", "testing", "production"];

                            if (uploadEnv.indexOf(env) === -1) {
                                console.log(`${chalk.yellow("[UPLOAD:AWS:WARNING]")}: Woops! Not allow to upload this template to ${env}`); //eslint-disable-line

                                return resolve(new Error(`Woops! Not allow to upload this template to ${env}`));
                            }

                            // Build bundle
                            console.log(`${chalk.cyan("[BUILD]")}: ...`); //eslint-disable-line
                            await build();
                            console.log(`${chalk.green("[BUILD:SUCCESS]")}.`); //eslint-disable-line

                            const zip_file = entry.zip;

                            if (!fs.pathExistsSync(normalizeAdUnitPath(`${config.releaseDir}/${zip_file}`))) {
                                console.log(`${chalk.yellow("[UPLOAD:MC:WARNING]")}: Woops! No zip file found: ${zip_file}`); //eslint-disable-line
                                return resolve(new Error(`Woops! No zip file found: ${zip_file}`));
                            }

                            const awsPaths = await uploadToS3(awsObj, zip_file);

                            if (message) {
                                if (!process.env.SLACK_CONVERSATION_IDS) {
                                    console.log(`${chalk.yellow("[SLACK:WARNING]")}: SLACK_CONVERSATION_IDS env variable not provided, no message was send to Slack`); //eslint-disable-line

                                    return resolve(null);
                                }
                                const template_name = entry.name;

                                const slackConversationIds = process.env.SLACK_CONVERSATION_IDS.trim().split(",");
                                const web = new WebClient(config.slackToken);

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

                                await Promise.all(awsPaths.map(async (obj) => {
                                    const initialMsg = `Hello everyone :heartbeat: 🦄 :bananaman: :fonzie: :borat:.\n \nIt is me, your trusted Dynamic Templates :robot_face:.\nWe updated bundle on *S3/${obj.s3pth}*.\n\n*Bundle ZIP* (Download and Extract):`;

                                    await Promise.all(slackConversationIds.map(async (conversationId) => {
                                        return web.files.upload({
                                            filename: filename,
                                            file: fs.createReadStream(normalizeAdUnitPath(`${entryTmpDir}/${filename}`)),
                                            channels: conversationId,
                                            initial_comment: initialMsg
                                        });
                                    }));

                                    console.log(`${chalk.green("[SLACK:SUCCESS]")}: ${obj.s3pth}`); //eslint-disable-line
                                }));
                            }

                            resolve(null);
                        } catch (x) {
                            resolve(x);
                        }
                    })();
                });
            }));

            await clean();

            const errors = results.filter(vl => {
                if (vl !== null) {
                    return vl;
                }
            });

            if (errors.length) {
                console.log(`${chalk.bold.red("[UPLOAD:AWS:FAIL1]")}`); //eslint-disable-line
                console.log(errors); //eslint-disable-line
                return process.exit(1);
            }

            console.log(`${chalk.bold.green("[UPLOAD:AWS:SUCCESS]")}`); //eslint-disable-line
            return process.exit(0);

        } catch (x) {
            await clean();

            console.log(`${chalk.bold.red("[UPLOAD:AWS:FAIL2]")}`); //eslint-disable-line
            console.log(x) //eslint-disable-line

            return process.exit(1);
        }
    })();
};

module.exports = { command, desc, builder, handler };
