// Moving from release to production/master
"use strict";

const chalk = require("chalk");
const { execSync } = require("child_process");
const semver = require("semver");
const replace = require("replace-in-file");
const changelog = require("@puppeteer701vungle/auto-changelog");
const { WebClient } = require("@slack/client");
const fs = require("fs-extra");
const config = require("../../build/config.js");
const { requireUncached } = require("../../build");
const __processDir = process.env.PWD || process.cwd();
const path = require("path");

const command = "fly <action>";
const desc = " Git flow fly operation on develop, release/* and master branches.";
const builder = {
    action: {
        alias: "a",
        describe: "Git flow fly action",
        type: "string",
        default: "topup",
        choices: ["finish", "topup", "hotfix", "stage", "sync"],
    },
    slack: {
        alias: "s",
        describe: "Slack message",
        type: "boolean",
        default: false,
        choices: [true, false],
    },
    message: {
        alias: "m",
        describe: "Map a fake commit message",
        type: "string"
    }
};

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir);
}

function getIncrement(lastCommit) {
    const increments = ["[PRERELEASE]", "[PATCH]", "[MINOR]", "[MAJOR]"];
    for (var i = 0; i < increments.length; i++) {
        // If multiple increments are provided, the smallest update will be chosen.
        if (lastCommit.includes(increments[i])) {
            return increments[i].replace(/[\][]/g, "").toLowerCase();
        }
    }
    throw new Error(`No versioning increment provided in git commit. Commit message must include one of the following: ${increments.join(", ")}`);
}

function generatePackageDependency(commitMsg) {
    const coreVersionArr = commitMsg.match(/\[CORE#(.*?)\]/i);
    if (!coreVersionArr) {
        return -1;
    }
    const coreVersion = coreVersionArr[1];

    const tplsArr = commitMsg.match(/\[TPLS:(.*?)\]/i);
    if (!tplsArr) {
        return -2;
    }
    const tpls = tplsArr[1];

    const tplArr = tpls.replace(/\s/g, "").split(",");

    let from = [ /vungle-dynamo-core.git#(.*?)\"/g ]; //eslint-disable-line
    let to = [`vungle-dynamo-core.git#${coreVersion}"`];

    tplArr.forEach((item) => {
        if (!item) {
            return;
        }

        let arr = item.split("#");
        from.push(new RegExp(`vungle-dynamo-tpl-${arr[0]}.git#(.*)\"`, "g")); //eslint-disable-line

        arr.splice(1, 0, ".git");
        arr.splice(2, 0, "#");
        to.push(`vungle-dynamo-tpl-${arr.join("")}"`);
    });

    return {
        commitMsg: `[CORE#${coreVersion}] [TPLS:${tpls}]`,
        from: from,
        to: to
    };
}

const NO_CHECK = ["vungle-dynamo-core"];

function _checkBeforeReleasing(branchName) {
    if (!branchName.match(/release\/(.*)/i)) {
      console.log(`${chalk.bold.red("[RELEASE:FAIL]")}: Only run this command on release branch.`); //eslint-disable-line
        return process.exit(1);
    }
}

function _checkBeforeStaging(branchName) {
    const BRANCH_NAMES = ["develop"];
    if (BRANCH_NAMES.indexOf(branchName) === -1) {
      console.error(`${chalk.bold.red("[STAGE:FAIL]")}: Only run this command on develop branch.`); //eslint-disable-line
        return process.exit(1);
    }
}

function _checkBeforeHotfix(branchName) {
    const BRANCH_NAMES = ["master"];
    if (BRANCH_NAMES.indexOf(branchName) === -1) {
    console.error(`${chalk.bold.red("[STAGE:FAIL]")}: Only run this command on master branch.`); //eslint-disable-line
        return process.exit(1);
    }
}

function _checkBeforeSyncing(branchName) {
    const BRANCH_NAMES = ["master"];
    if (BRANCH_NAMES.indexOf(branchName) === -1) {
      console.error(`${chalk.bold.red("[STAGE:FAIL]")}: Only run this command on master branch.`); //eslint-disable-line
        return process.exit(1);
    }
}

const handler = async ({ message, action, slack }) => {
    action = action.toUpperCase();
  console.log(`${chalk.bold.cyan(`${action}`)}: ...`); //eslint-disable-line

    const commitMsg = message || execSync("git log -1 --pretty=%B").toString().trim();

    if (!commitMsg.match(new RegExp(`\\[${action}]`, "i"))) {
      console.log(`${chalk.bold.yellow(`[${action}:WARNING]`)}: Skip, because [${action}] is not present in commit.`); //eslint-disable-line
        return process.exit(0);
    }

    try {
        const branchName = execSync("git branch | sed -n '/\* /s///p'").toString().trim(); //eslint-disable-line
        let currentVersion = requireUncached(normalizeAdUnitPath("package.json")).version;
        let newVersion = "";
        let incrementLevel = "";
        let incrementIdentifier = "";
        let newCommitMessage = [`[${action}]`];

        switch (action) {
        // merge release branch to master and get it ready for deployment
        case "FINISH":
            _checkBeforeReleasing(branchName);
            newCommitMessage.push("[skip CI]");

            incrementLevel = getIncrement(commitMsg);
            newVersion = semver.inc(currentVersion, incrementLevel, incrementIdentifier);

            // merge release branch to master
            execSync("git checkout master");
            execSync("git pull");
            execSync(`git merge ${branchName} --no-commit`);

            break;

        // Create a new release candidate branch for QA
        case "STAGE":
            _checkBeforeStaging(branchName);
            newCommitMessage.push("[TOPUP]");

            incrementLevel = "prerelease";
            incrementIdentifier = "beta";
            newVersion = semver.inc(currentVersion, incrementLevel, incrementIdentifier);

            // create a new release branch from develop
            execSync(`git checkout -b release/${newVersion.match(/(.*)-beta/g)[0]}`);

            break;

        // Increase semver of release candidate
        case "TOPUP":
            _checkBeforeReleasing(branchName);
            newCommitMessage.push("[skip CI]");

            incrementLevel = "prerelease";
            incrementIdentifier = "beta";
            newVersion = semver.inc(currentVersion, incrementLevel, incrementIdentifier);

            break;

        case "HOTFIX":
            _checkBeforeHotfix(branchName);
            newCommitMessage.push("[skip CI]");
            incrementLevel = "patch";

            newVersion = semver.inc(currentVersion, incrementLevel);

            break;
        case "SYNC":
            _checkBeforeSyncing(branchName);
            newCommitMessage.push("[skip CI]");

            newVersion = requireUncached(normalizeAdUnitPath("package.json")).version;

            // merge master branch to develop
            execSync("git checkout develop");
            execSync("git pull");
            execSync("git merge -Xours master --no-commit");

            incrementLevel = getIncrement(commitMsg);

            currentVersion = requireUncached(normalizeAdUnitPath("package.json")).version;
            break;
        }

        const projectName = requireUncached(normalizeAdUnitPath("package.json")).name;

        let from = [];
        let to = [];

        // in case core, dont need to check for any packages
        if (NO_CHECK.indexOf(projectName) === -1) {
            const packageDependency = generatePackageDependency(commitMsg);
            if (packageDependency === -1) {
                console.log(`${chalk.bold.red(`[${action}:FAIL]`)}: Stopped, because [CORE#vX.X.X] is not present in commit.`); //eslint-disable-line
                return process.exit(1);
            }

            if (packageDependency === -2) {
                console.log(`${chalk.bold.red(`[${action}:FAIL]`)}: Stopped, because [TPLS:TPL_NAME#vX.X.X, TPL_NAME1#vY.Y.Y] is not present in commit.`); //eslint-disable-line
                return process.exit(1);
            }

            from = packageDependency.from;
            to = packageDependency.to;
            newCommitMessage.push(packageDependency.commitMsg);
        }

        await replace({
            files: "package.json",
            from: [ `"version": "${currentVersion}"`, ...from ],
            to: [ `"version": "${newVersion}"`,...to ]
        });

        execSync("npm install && npm install");

        execSync(`git add package*.json && git commit -m "chore: bumped to version v${newVersion} [${incrementLevel.toUpperCase()}] ${newCommitMessage.join(" ")}"`);

        switch (action) {
        case "FINISH":
        case "HOTFIX":
        case "TOPUP":
            execSync(`git tag v${newVersion}`);
            execSync("git push origin && git push origin --tags");
            break;
        case "STAGE":
            // create a new release branch from develop
            execSync(`git push --set-upstream origin release/${newVersion.match(/(.*)-beta/g)[0]}`);
            break;
        case "SYNC":
            execSync("git push origin");
            break;
        }

        console.log(`${chalk.green(`[${action}:SUCCESS]`)}: v${newVersion}`); //eslint-disable-line

        if (!slack) {
            return;
        }

        console.log(`${chalk.bold.cyan("[SLACK]")}: Slack Message`); //eslint-disable-line

        if (!process.env.SLACK_CONVERSATION_IDS) {
            return console.log(`${chalk.yellow("[SLACK:WARNING]")}: SLACK_CONVERSATION_IDS env variable not provided, no message was send to Slack`); //eslint-disable-line
        }

        // generate changelog
        await changelog.generate();

        const slackConversationIds = process.env.SLACK_CONVERSATION_IDS.trim().split(",");
        const web = new WebClient(config.slackToken);
        await Promise.all(slackConversationIds.map(async (conversationId) => {
            const name = require(normalizeAdUnitPath("package.json")).name;
            const changelogFilename = `${name}-${newVersion}-CHANGELOG.md`;
            return await web.files.upload({
                filename: changelogFilename,
                file: fs.createReadStream(normalizeAdUnitPath("CHANGELOG.md")),
                channels: conversationId,
                initial_comment: `Hello everyone :heartbeat: 🦄 :bananaman: :fonzie: :borat:.\n \nIt is me, your trusted Dynamic Templates :robot_face:.\nWe released a new version of \`${name}\`. Please update your packages so you can use the latest and greatest features.\n*Version*\n\`v${newVersion}\``
            });
        }));

    console.log(`${chalk.bold.green("[SLACK]")}: Slack Message`); //eslint-disable-line


    } catch (x) {
        console.log(`${chalk.bold.red(`[${action}:FAIL]`)}`); //eslint-disable-line
        console.log(x) //eslint-disable-line

        return process.exit(1);
    }

};

module.exports = { command, desc, builder, handler };


