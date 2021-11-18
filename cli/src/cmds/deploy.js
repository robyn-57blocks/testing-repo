"use strict";

// split this into bundle and deploy

const chalk = require("chalk");
const path = require("path");
const cheerio = require("cheerio");
const request = require("superagent");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const { WebClient } = require("@slack/client");
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


const command = "deploy";
const desc = "Create new version of bundle and deploy to dashboard";
const builder = {
    env: {
        alias: "e",
        describe: "Environment",
        type: "string",
        default: "development",
        choices: ["development", "testing", "production", "auto"]
    },
    force: {
        alias: "f",
        describe: "Run command even if [DEPLOY] not present in commit message",
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
    api: {
        alias: "a",
        describe: "Upload through which dashboard",
        type: "string",
        default: "mc",
        choices: ["mc", "legacy"],
    }
};

const agent = request.agent();
let csrfToken = null;
let jwtToken = null;
let prefix = null;

async function login(auth) {
    return new Promise((resolve, reject) => {
        agent
            .get(`${prefix}/dashboard/login`)
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                csrfToken = cheerio.load(res.text)("input").filter("#csrf").val();

                agent
                    .post(`${prefix}/dashboard/login`)
                    .send({
                        email: auth.username,
                        password: auth.password,
                        _csrf: csrfToken
                    })
                    .end(function (err, res) {
                        if (err) {
                            return reject(err);
                        }

                        resolve(res);
                    });
            });
    });
}

async function loginMC(auth) {
    return new Promise((resolve, reject) => {
        agent
            .post(`${prefix.auth}/login`)
            .set("vungle-source", "ctrl")
            .set("vungle-version", "1")
            .send({
                username: auth.username,
                password: auth.password,
            })
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                jwtToken = `Bearer ${res.body.token}`;
                resolve(res);
            });
    });
}

async function uploadNewTemplate(zipFile, template) {
    return new Promise((resolve, reject) => {
        agent
            .post(`${prefix}/dashboard/api/1/templates/template_upload_new`)
            .set("X-CSRF-Token", csrfToken)
            .attach("file", normalizeAdUnitPath(`${config.releaseDir}/${zipFile}`))
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                const body = res.body;
                const data = Object.assign(template, {
                    cdn_url: body.cdnUrl,
                    configFileChecksum: "",
                    created: Date.now(),
                    replacements: res.body.replacements.update,
                    version: 0
                });

                agent
                    .post(`${prefix}/dashboard/api/1/templates`)
                    .set("X-CSRF-Token", csrfToken)
                    .send(data)
                    .end(function (err, res) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(res);
                    });
            });
    });
}


async function uploadNewTemplateMC(zipFile, template) {
    return new Promise((resolve, reject) => {
        agent
            .post(`${prefix.upload}/template`)
            .set("vungle-source", "ctrl")
            .set("vungle-version", "1")
            .set("authorization", jwtToken)
            .attach("file", normalizeAdUnitPath(`${config.releaseDir}/${zipFile}`))
            .field("title", zipFile)
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                if (res.status !== 200) {
                    return reject(res);
                }

                const body = res.body.template;
                const data = Object.assign(template, {
                    cdn_url: body.cdnUrl,
                    replacements: body.replacements.map(replacement => {
                        if (replacement.value === null) {
                            replacement.value = "";
                        }
                        return replacement;
                    })
                });

                if (!("supported_template_protocol" in data)) {
                    data.supported_template_protocol =  "vungle_mraid";
                }
                if (!("opportunity" in data)) {
                    data.opportunity =  "video";
                }
                if (!("applications" in data)) {
                    data.applications =  [];
                }

                agent
                    .post(`${prefix.manage}/templates`)
                    .set("vungle-source", "ctrl")
                    .set("vungle-version", "1")
                    .set("authorization", jwtToken)
                    .send(data)
                    .end(function (err, res) {
                        if (err) {
                            return reject(err);
                        }
                        if (res.status !== 200) {
                            return reject(res);
                        }

                        resolve(res);
                    });
            });
    });
}

async function getTemplate(name) {
    return new Promise((resolve, reject) => {
        agent
            .get(`${prefix}/dashboard/api/1/templates`)
            .set("X-CSRF-Token", csrfToken)
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                if (!res.body.filter) {
                    return reject(res.redirects);
                }

                const template = res.body.filter(template => {
                    if (template.name === name) {
                        return template;
                    }
                })[0];

                if (!template) {
                    return resolve(new Error("Whoops! No Template Found"));
                }

                resolve(template);
            });
    });
}


async function getTemplateMC(name) {
    return new Promise((resolve, reject) => {
        agent
            .get(`${prefix.manage}/templates?page=1&per_page=1000`)
            .set("vungle-source", "ctrl")
            .set("vungle-version", "1")
            .set("authorization", jwtToken)
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                if (res.status !== 200) {
                    return reject(res);
                }

                if (!res.body.filter) {
                    return reject(res.redirects);
                }

                const template = res.body.filter(template => {
                    if (template.name === name) {
                        return template;
                    }
                })[0];

                if (!template) {
                    return resolve(new Error("Whoops! No Template Found"));
                }

                resolve(template);
            });
    });
}

async function replaceTemplate(zipFile, template) {
    return new Promise((resolve, reject) => {
        agent
            .post(`${prefix}/dashboard/api/1/templates/template_upload_update/${template._id}`)
            .timeout({
                deadline: 15e3, // but allow 15s for the file to finish loading.
            })
            .set("X-CSRF-Token", csrfToken)
            .attach("file", normalizeAdUnitPath(`${config.releaseDir}/${zipFile}`))
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                const body = res.body;
                const data = Object.assign(template, {
                    cdn_url: body.cdnUrl,
                    dateModified: Date.now()
                });

                agent
                    .put(`${prefix}/dashboard/api/1/templates/${template._id}`)
                    .timeout({
                        deadline: 15e3, // but allow 15s for the file to finish loading.
                    })
                    .set("X-CSRF-Token", csrfToken)
                    .send(data)
                    .end(function (err, res) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(res);
                    });
            });
    });
}

async function replaceTemplateMC(zipFile, template) {
    return new Promise((resolve, reject) => {
        agent
            .post(`${prefix.upload}/template/${template.id}/edit`)
            .timeout({
                deadline: 15e3, // but allow 15s for the file to finish loading.
            })
            .set("vungle-source", "ctrl")
            .set("vungle-version", "1")
            .set("authorization", jwtToken)
            .attach("file", normalizeAdUnitPath(`${config.releaseDir}/${zipFile}`))
            .field("title", zipFile)
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }
                if (res.status !== 200) {
                    return reject(res);
                }

                const body = res.body.template;
                const data = Object.assign(template, {
                    cdn_url: body.cdnUrl,
                    replacements: body.replacements.map(replacement => {
                        if (replacement.value === null) {
                            replacement.value = "";
                        }
                        return replacement;
                    })
                });

                agent
                    .post(`${prefix.manage}/templates/${template.id}`)
                    .timeout({
                        deadline: 15e3, // but allow 15s for the file to finish loading.
                    })
                    .set("vungle-source", "ctrl")
                    .set("vungle-version", "1")
                    .set("authorization", jwtToken)
                    .send(data)
                    .end(function (err, res) {
                        if (err) {
                            return reject(err);
                        }

                        if (res.status !== 200) {
                            return reject(res);
                        }
                        resolve(res);
                    });
            });
    });
}

function verifyEnvironmentVariables(env, api) {
    switch (env) {
    case "development":
        if (!process.env.DASHBOARD_DEV_USERNAME) {
            throw new Error("env.DASHBOARD_DEV_USERNAME missing");
        }

        if (!process.env.DASHBOARD_DEV_PASSWORD) {
            throw new Error("env.DASHBOARD_DEV_PASSWORD missing");
        }

        if (api === "mc") {
            if (!process.env.DASHBOARD_DEV_URL_MC_AUTH) {
                throw new Error("env.DASHBOARD_DEV_URL_MC_AUTH missing");
            }

            if (!process.env.DASHBOARD_DEV_URL_MC_UPLOAD) {
                throw new Error("env.DASHBOARD_DEV_URL_MC_UPLOAD missing");
            }

            if (!process.env.DASHBOARD_DEV_URL_MC_MANAGE) {
                throw new Error("env.DASHBOARD_DEV_URL_MC_MANAGE missing");
            }
        } else {
            if (!process.env.DASHBOARD_DEV_URL) {
                throw new Error("env.DASHBOARD_DEV_URL missing");
            }
        }
        break;
    case "testing":
        if (!process.env.DASHBOARD_QA_USERNAME) {
            throw new Error("env.DASHBOARD_QA_USERNAME missing");
        }

        if (!process.env.DASHBOARD_QA_PASSWORD) {
            throw new Error("env.DASHBOARD_QA_PASSWORD missing");
        }

        if (api === "mc") {
            if (!process.env.DASHBOARD_QA_URL_MC_AUTH) {
                throw new Error("env.DASHBOARD_QA_URL_MC_AUTH missing");
            }

            if (!process.env.DASHBOARD_QA_URL_MC_UPLOAD) {
                throw new Error("env.DASHBOARD_QA_URL_MC_UPLOAD missing");
            }

            if (!process.env.DASHBOARD_QA_URL_MC_MANAGE) {
                throw new Error("env.DASHBOARD_QA_URL_MC_MANAGE missing");
            }
        } else {
            if (!process.env.DASHBOARD_QA_URL) {
                throw new Error("env.DASHBOARD_QA_URL missing");
            }
        }
        break;
    case "production":
        if (!process.env.DASHBOARD_PROD_USERNAME) {
            throw new Error("env.DASHBOARD_PROD_USERNAME missing");
        }

        if (!process.env.DASHBOARD_PROD_PASSWORD) {
            throw new Error("env.DASHBOARD_PROD_PASSWORD missing");
        }

        if (api === "mc") {
            if (!process.env.DASHBOARD_PROD_URL_MC_AUTH) {
                throw new Error("env.DASHBOARD_PROD_URL_MC_AUTH missing");
            }

            if (!process.env.DASHBOARD_PROD_URL_MC_UPLOAD) {
                throw new Error("env.DASHBOARD_PROD_URL_MC_UPLOAD missing");
            }

            if (!process.env.DASHBOARD_PROD_URL_MC_MANAGE) {
                throw new Error("env.DASHBOARD_PROD_URL_MC_MANAGE missing");
            }
        } else {
            if (!process.env.DASHBOARD_PROD_URL) {
                throw new Error("env.DASHBOARD_PROD_URL missing");
            }
        }
        break;
    }
    return true;
}

function getDashboardURL(env) {
    switch (env) {
    case "development":
        return process.env.DASHBOARD_DEV_URL;
    case "testing":
        return process.env.DASHBOARD_QA_URL;
    case "production":
        return process.env.DASHBOARD_PROD_URL;
    }
}

function getDashboardURLMC(env) {
    switch (env) {
    case "development":
        return {
            auth: process.env.DASHBOARD_DEV_URL_MC_AUTH,
            upload: process.env.DASHBOARD_DEV_URL_MC_UPLOAD,
            manage: process.env.DASHBOARD_DEV_URL_MC_MANAGE,
        };
    case "testing":
        return {
            auth: process.env.DASHBOARD_QA_URL_MC_AUTH,
            upload: process.env.DASHBOARD_QA_URL_MC_UPLOAD,
            manage: process.env.DASHBOARD_QA_URL_MC_MANAGE,
        };
    case "production":
        return {
            auth: process.env.DASHBOARD_PROD_URL_MC_AUTH,
            upload: process.env.DASHBOARD_PROD_URL_MC_UPLOAD,
            manage: process.env.DASHBOARD_PROD_URL_MC_MANAGE,
        };
    }
}

function getDashboardAuthentication(env) {
    switch (env) {
    case "development":
        return {
            username: process.env.DASHBOARD_DEV_USERNAME,
            password: process.env.DASHBOARD_DEV_PASSWORD
        };
    case "testing":
        return {
            username: process.env.DASHBOARD_QA_USERNAME,
            password: process.env.DASHBOARD_QA_PASSWORD
        };
    case "production":
        return {
            username: process.env.DASHBOARD_PROD_USERNAME,
            password: process.env.DASHBOARD_PROD_PASSWORD
        };
    }
}

async function uploadToDashboard(env, vungleConfig) {
    console.log(`${chalk.cyan("[UPLOAD]")}: ...`); //eslint-disable-line
    await login(getDashboardAuthentication(env));

    return Promise.all(vungleConfig.dashboard.map(tpl_entry => {
        return new Promise((resolve) => {
            (async function () {
                const uploadEnv = tpl_entry.upload || ["development", "testing", "production"];
                if (uploadEnv.indexOf(env) === -1) {
                    console.log(`${chalk.yellow("[DEPLOY:LEGACY:WARNING]")}: Woops! Not allow to upload this template ${tpl_entry.template.name} to ${env}`); //eslint-disable-line
                    return resolve(new Error(`Woops! Not allow to upload this template ${tpl_entry.template.name} to ${env}`));
                }

                const zip_file = tpl_entry.zip;

                if (!fs.pathExistsSync(normalizeAdUnitPath(`${config.releaseDir}/${zip_file}`))) {
                    console.log(`${chalk.yellow("[DEPLOY:LEGACY:WARNING]")}: Woops! No zip file found: ${zip_file}`); //eslint-disable-line
                    return resolve(new Error(`Woops! No zip file found: ${zip_file}`));
                }

                const dashboard_entry = tpl_entry.template;

                try {
                    console.log(`${chalk.cyan("[DEPLOY:LEGACY:SEND]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                    let template = null;
                    try {
                        template = await getTemplate(dashboard_entry.name);
                    } catch (x) {
                        return resolve(x);
                    }

                    if (template instanceof Error) {
                        console.log(`${chalk.cyan("[DEPLOY:LEGACY:CREATE]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                        await uploadNewTemplate(zip_file, dashboard_entry);
                    } else  {
                        console.log(`${chalk.cyan("[DEPLOY:LEGACY:REPLACE]")}: ${template._id}.`); //eslint-disable-line
                        await replaceTemplate(zip_file, template);
                    }

                    console.log(`${chalk.green("[DEPLOY:LEGACY:SUCCESS]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                    resolve("success");
                } catch (x) {
                    console.log(`${chalk.red("[DEPLOY:LEGACY:FAIL]")}: ${zip_file}`); //eslint-disable-line
                    console.log(x) //eslint-disable-line
                    resolve(x);
                }
            })();
        });
    }));
}

async function uploadToDashboardMS(env, vungleConfig) {
  console.log(`${chalk.cyan("[DEPLOY:MS]")}: ...`); //eslint-disable-line
    await loginMC(getDashboardAuthentication(env));

    return Promise.all(vungleConfig.dashboard.map(tpl_entry => {
        return new Promise((resolve) => {
            (async function () {
                const uploadEnv = tpl_entry.upload || ["development", "testing", "production"];
                if (uploadEnv.indexOf(env) === -1) {
                    console.log(`${chalk.yellow("[DEPLOY:MC:WARNING]")}: Woops! Not allow to upload this template ${tpl_entry.template.name} to ${env}`); //eslint-disable-line
                    return resolve(new Error(`Woops! Not allow to upload this template ${tpl_entry.template.name} to ${env}`));
                }

                const zip_file = tpl_entry.zip;

                if (!fs.pathExistsSync(normalizeAdUnitPath(`${config.releaseDir}/${zip_file}`))) {
                    console.log(`${chalk.yellow("[DEPLOY:MC:WARNING]")}: Woops! No zip file found: ${zip_file}`); //eslint-disable-line
                    return resolve(new Error(`Woops! No zip file found: ${zip_file}`));
                }

                const dashboard_entry = tpl_entry.template;

                try {
                    console.log(`${chalk.cyan("[DEPLOY:MC:SEND]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                    let template = null;
                    try {
                        template = await getTemplateMC(dashboard_entry.name);
                    } catch (x) {
                        return resolve(x);
                    }

                    if (template instanceof Error) {
                        console.log(`${chalk.cyan("[DEPLOY:MC:CREATE]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                        await uploadNewTemplateMC(zip_file, dashboard_entry);
                    } else  {
                        console.log(`${chalk.cyan("[DEPLOY:MC:REPLACE]")}: ${template.id}.`); //eslint-disable-line
                        await replaceTemplateMC(zip_file, template);
                    }

                    console.log(`${chalk.green("[DEPLOY:MC:SUCCESS]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                    resolve("success");
                } catch (x) {
                    console.log(`${chalk.red("[DEPLOY:MC:FAIL]")}: ${zip_file}`); //eslint-disable-line
                    console.log(x) //eslint-disable-line
                    resolve(x);
                }
            })();
        });
    }));
}

async function slackMessage(env, tag, vungleConfig, uploadResults) {
    console.log(`${chalk.bold.cyan("[SLACK]")}: ...`); //eslint-disable-line
    const web = new WebClient(config.slackToken);
    return Promise.all(vungleConfig.dashboard.map((tpl_entry, indx) => {
        return new Promise((resolve) => {
            (async function () {
                if (!process.env.SLACK_CONVERSATION_IDS) {
                     console.log(`${chalk.yellow("[SLACK:WARNING]")}: SLACK_CONVERSATION_IDS env variable not provided, no message was send to Slack`); //eslint-disable-line
                    return resolve("success");
                }

                const zip_file = tpl_entry.zip;

                if (!fs.pathExistsSync(normalizeAdUnitPath(`${config.releaseDir}/${zip_file}`))) {
                  console.log(`${chalk.yellow("[SLACK:WARNING]")}: Woops! No zip file found: ${zip_file}`); //eslint-disable-line
                    return resolve(new Error(`Woops! No zip file found: ${zip_file}`));
                }

                const dashboard_entry = tpl_entry.template;

                try {
                    console.log(`${chalk.cyan("[SLACK:SEND]")}: ${dashboard_entry.name}.`); //eslint-disable-line
                    const filename = `${tag}-${zip_file}`;
                    const entryBundleDir = `${config.bundlesDir}/${dashboard_entry.name}`;
                    const entryTmpDir = `${config.tmpDir}/${dashboard_entry.name}`;

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

                    let isUploaded = "success";

                    if (uploadResults.length) {
                        if ((tpl_entry.upload || ["development", "testing", "production"]).indexOf(env) === -1) {
                            isUploaded = "only-slack";
                        } else if (["success"].indexOf(uploadResults[indx]) === -1) {
                            isUploaded = "error";
                        }
                    } else {
                        isUploaded = false;
                    }

                    const slackConversationIds = process.env.SLACK_CONVERSATION_IDS.trim().split(",");
                    const initialMsg = generateSlackMessage(
                        isUploaded,
                        env,
                        dashboard_entry.name,
                        tag
                    );
                    await Promise.all(slackConversationIds.map(async (conversationId) => {
                        return web.files.upload({
                            filename: filename,
                            file: fs.createReadStream(normalizeAdUnitPath(`${entryTmpDir}/${filename}`)),
                            channels: conversationId,
                            initial_comment: initialMsg
                        });
                    }));

                  console.log(`${chalk.green("[SLACK:SUCCESS]")}: ${dashboard_entry.name}`); //eslint-disable-line

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

function generateSlackMessage(upload, env, name, tag) {
    const URL = prefix.manage || prefix;

    if (["success"].indexOf(upload) !== -1) {
        return `Hello everyone :heartbeat: 🦄 :bananaman: :fonzie: :borat:.\n \nIt is me, your trusted Dynamic Templates :robot_face:.\nWe just updated template *${name}* on ${URL}.\n \n*Version*\n\`v${tag}\`\n \n*CHANGELOG* with *Bundle ZIP* (Download and Extract):`;
    }

    if (["error"].indexOf(upload) !== -1) {
        return `Hello everyone :heartbeat: 🦄 :bananaman: :fonzie: :borat:.\n \nIt is me, your trusted Dynamic Templates :robot_face:.\nWe tried to updated template *${name}* on ${URL}, but something went wrong.\n*Please download the bundle and try to update it manually.*\n \n*Version*\n\`v${tag}\`\n \n*CHANGELOG* with *Bundle ZIP* (Download and Extract):`;
    }

    return `Hello everyone :heartbeat: 🦄 :bananaman: :fonzie: :borat:.\n \nIt is me, your trusted Dynamic Templates :robot_face:.\nWe are publishing a new release candidate bundle.\n*Version*\n\`v${tag}\`\n \n*CHANGELOG* with *Bundle ZIP* (Download and Extract):`;
}

const handler = ({ env, force, omsdk, api }) => {
    console.log(`${chalk.bold.cyan("[DEPLOY]")}: ...`); //eslint-disable-line

    const commitMsg = execSync("git log -1 --pretty=%B").toString().trim();
    if (!commitMsg.match(/\[DEPLOY]/i) && !force) {
        console.log(`${chalk.bold.yellow("[DEPLOY:WARNING]")}: Skip deploying, because [DEPLOY] is not present in commit.`); //eslint-disable-line
        return process.exit(0);
    }

    let vungleConfig = null;

    process.env.NODE_ENV = "production";
    process.env.I18N_CDN = process.env.I18N_CDN || config.i18nCDN;
    process.env.NODE_OMSDK = omsdk;

    try {
        vungleConfig = require(normalizeAdUnitPath(config.vungleConfigFilename));

        if (!vungleConfig.dashboard) {
            console.error(`${chalk.bgRed("[FAILED]")}: Entered ad unit does not have deploy permissions in ${chalk.magenta(config.vungleConfigFilename)} file.`); //eslint-disable-line
            return process.exit(1);
        }
    } catch (x) {
        console.error(`${chalk.bgRed("[FAILED]")}: Entered ad unit is missing ${chalk.magenta(config.vungleConfigFilename)} file.`); //eslint-disable-line
        return process.exit(1);
    }

    if (env === "auto") {
        const branchName = execSync("git branch | sed -n '/\* /s///p'").toString().trim(); //eslint-disable-line
        if (!branchName.match(/release\/(.*)/i) && branchName !== "master" && branchName !== "develop") {
            console.log(`${chalk.bold.red("[DEPLOY:FAIL]")}: Only run this command on release or master branch when env is set to auto.`); //eslint-disable-line
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

    // Check if all env variables are provided if we are uploading though dashboard
    try {
        verifyEnvironmentVariables(env, api);
    } catch (x) {
        console.error(`${chalk.bold.red("[DEPLOY:FAIL]")}: Environment variables are not set.\n${x}`); //eslint-disable-line
        return process.exit(1);
    }

    if (api === "legacy") {
        prefix = getDashboardURL(env);
    } else if (api === "mc") {
        prefix = getDashboardURLMC(env);
    }

    (async function () {
        try {
            // Tag git repo
            const tag = require(normalizeAdUnitPath("package.json")).version;

            const changelog = require("@puppeteer701vungle/auto-changelog");
            await changelog.generate(); // generate CHANGELOG.md

            // Build bundle
            console.log(`${chalk.cyan("[BUILD]")}: ...`); //eslint-disable-line
            await build();
            console.log(`${chalk.green("[BUILD:SUCCESS]")}.`); //eslint-disable-line

            let uploadResults = [];
            // Upload bundle to dashboard
            if (api === "legacy") {
                uploadResults = await uploadToDashboard(env, vungleConfig);
            } else if (api === "mc") {
                uploadResults = await uploadToDashboardMS(env, vungleConfig);
            }

            // Upload bundle to slack
            await slackMessage(env, tag, vungleConfig, uploadResults);

            await clean();

            console.log(`${chalk.bold.green("[DEPLOY:SUCCESS]")}`); //eslint-disable-line
        } catch (x) {
            await clean();

            console.log(`${chalk.bold.red("[DEPLOY:FAIL]")}`); //eslint-disable-line
            console.log(x) //eslint-disable-line

            return process.exit(1);
        }
    })();
};

module.exports = { command, desc, builder, handler };
