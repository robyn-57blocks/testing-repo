"use strict";

const chalk = require("chalk");
const fs = require("fs-extra");
const replace = require("replace-in-file");
const inquirer = require("inquirer");
const { exec } = require("child_process");
const path = require("path");

const config = require("../../build/config.js");

const command = "create <name>";
const desc = "Create a new ad unit";

const __processDir = process.env.PWD || process.cwd();

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir);
}

try {
    require("dotenv").config({
        path: normalizeAdUnitPath(".env")
    });
} catch (x) {}//eslint-disable-line

const builder = {
    name: {
        alias: "n",
        describe: "Folder name (dynamic_template_name)",
        demand: true,
        type: "string"
    }
};

function gitClone(pack, name, branch) {
    return new Promise((resolve, reject) => {
        const cmd = `git clone -b ${branch} git@bitbucket.org:vungle_creative_labs/${pack}.git ${name}`;
        exec(cmd, (err, stdout) => {
            if (err) {
                return reject(err);
            }
            resolve(stdout);
        });
    });
}

function processAnswers(answers){
    console.log("And your answers are:", answers);
}

const handler = async ({ name }) => {
    if (name === "" || name.match(/\s+/g) !== null) {
      console.error(`${chalk.bold.red("[CREATE:FAIL]")}: ${chalk.blue(name)} file/folder path name is not allowed.`); //eslint-disable-line
        return process.exit(1);
    }

    const endPth = `${process.cwd()}/${name}`;
    console.log(`${chalk.bold.cyan("[CREATE]")}: ...`);//eslint-disable-line

    if (await fs.pathExists(endPth)) {
        console.error(`${chalk.bold.red("[CREATE:FAIL]")}: ${chalk.blue(name)} file/folder already present here.`); //eslint-disable-line
        return process.exit(1);
    }

    console.log(`${chalk.hex('#2f90ce').bold("Dynamo CLI")}`);//eslint-disable-line
    const prompt = inquirer.createPromptModule();
    const questions = [
        {
            name: "preset",
            type: "list",
            message: "Please pick a preset",
            choices: [
                "single-view",
                "multi-view",
                "endcard"
            ],
            default: "single-view"
        },
        {
            name: "template_name",
            type: "input",
            message: "Templates name (Test Template)",
            validate: (name) => {
                if (!(name !== "")) {
                    console.log(chalk.red("\nInput required."));
                    return false;
                }
                return true;
            }
        },
        {
            name: "zip_name",
            type: "input",
            message: "Bundle name (testTemplate)",
            validate: (name) => {
                if (!(name !== "" && name.match(/\s+/g) === null && name[0].match(/[A-Z]/) === null)) {
                    console.log(chalk.red("\nInput required or wrong format entered."));
                    return false;
                }
                return true;
            }
        },
        {
            name: "page_name",
            type: "input",
            message: "Page name (TestPage)",
            validate: (name) => {
                if (!(name !== "" && name.match(/\s+/g) === null && name[0].match(/[A-Z]/) !== null)) {
                    console.log(chalk.red("\nInput required or wrong format entered."));
                    return false;
                }
                return true;
            }
        },
        {
            name: "version",
            type: "input",
            message: "Version number (develop, master, specific version e.q. v1.0.0)",
            default: "master"
        }
    ];

    const answers = await prompt(questions, processAnswers);

    console.log(`${chalk.cyan("[CREATE]")}: ${name}`);//eslint-disable-line

    let repository = "singleview";
    let vungleConfName = "singleView";
    let pagesVungleConfName = "SingleView";
    let templateName = "Single View";
    let descName = "Single view";

    if (answers.preset.includes("multi")) {
        repository = "multiview";
        vungleConfName = "multiView";
        pagesVungleConfName = "MultiView";
        templateName = "Multi View";
        descName = "Multi view";
    } else if (answers.preset.includes("endcard")) {
        repository = "endcard";
        vungleConfName = "endcard";
        pagesVungleConfName = "Endcard";
        templateName = "Endcard View";
        descName = "Endcard view";
    }

    await gitClone(`vungle-dynamo-tpl-${repository}`, name, answers.version);

    const zipName = `${vungleConfName}.zip`;
    const packageJsonName = `vungle-dynamo-tpl-${repository}`;

    await fs.renameSync(`${endPth}/src/pages/${pagesVungleConfName}`, `${endPth}/src/pages/${answers.page_name}`);

    const adUnitConfig = require(`${endPth}/src/${config.adUnitConfigFile}`);
    delete adUnitConfig.pages;
    delete adUnitConfig.components;

    await fs.writeJsonSync(`${endPth}/src/adUnitConfig.json`, adUnitConfig, {
        spaces: "\t"
    });

    console.log(new RegExp(vungleConfName, "g"));
    console.log(new RegExp(pagesVungleConfName, "g"));
    console.log(new RegExp(zipName, "g"));
    console.log(new RegExp(templateName, "g"));
    await Promise.all([
        await replace({
            files: `${endPth}/vungle.config.js`,
            from: [
                new RegExp(vungleConfName, "g"),
                new RegExp(zipName, "g"),
                new RegExp(templateName, "g")
            ],
            to: [
                answers.zip_name,
                `${answers.zip_name}.zip`,
                answers.template_name
            ]
        }),
        await replace({
            files: `${endPth}/README.md`,
            from: [
                new RegExp(vungleConfName, "g"),
                new RegExp(zipName, "g"),
                new RegExp(templateName, "g")
            ],
            to: [
                answers.template_name,
                `${answers.zip_name}.zip`,
                answers.template_name
            ]
        }),
        await replace({
            files: `${endPth}/src/${config.adUnitConfigFile}`,
            from: [
                /pages:\[(.*)]/g
            ],
            to: [
                "pages:[]"
            ]
        }),
        await replace({
            files: `${endPth}/package.json`,
            from: [ new RegExp(packageJsonName, "g") ],
            to: [`vungle-dynamo-tpl-${(answers.template_name.slice()).replace(/\s+/g, "").toLowerCase()}`.toLowerCase() ]
        }),
        await replace({
            files: `${endPth}/package.json`,
            from: [ new RegExp(descName, "g"), new RegExp(pagesVungleConfName, "g") ],
            to: [ `${answers.template_name} view`, answers.page_name]
        }),
        await replace({
            files: `${endPth}/src/vungle.main.js`,
            from: [ new RegExp(pagesVungleConfName, "g") ],
            to: [ answers.page_name ]
        }),
        await replace({
            files: `${endPth}/src/pages/${answers.page_name}/controller.js`,
            from: [ new RegExp(pagesVungleConfName, "g") ],
            to: [ answers.page_name ]
        }),
        await replace({
            files: `${endPth}/src/pages/${answers.page_name}/style.scss`,
            from: [ new RegExp(pagesVungleConfName, "g") ],
            to: [ answers.page_name ]
        }),
        await replace({
            files: `${endPth}/src/pages/${answers.page_name}/template.hbs`,
            from: [ new RegExp(pagesVungleConfName, "g") ],
            to: [ answers.page_name ]
        })
    ]);

    await fs.remove(`${endPth}/.git`);

    console.log(`${chalk.bold.green("[CREATE:SUCCESS]")}: Building Finished.`); //eslint-disable-line
    console.log(`${chalk.cyan("[RUN]")}\ncd ${name}\nnpm install && npm install`); //eslint-disable-line
};

module.exports = { command, desc, builder, handler };
