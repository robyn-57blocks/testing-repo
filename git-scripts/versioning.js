const fs = require('fs-extra')
const semver = require('semver');
const git = require('git-last-commit');

getNewVersion();

async function getNewVersion() {
    let pkg = await fs.readJson('./package.json')
    let increment = await getIncrement()
    let newVersion = semver.inc(pkg.version, increment)
    pkg.version = newVersion
    await fs.writeJson(`./package.json`, pkg)
}

async function getIncrement() {
    try {
        let lastCommit = await getLastCommitMessage()
        console.log(lastCommit);
        if (lastCommit.notes !== 'master')
            return // only version master branch.
        
        const increments = ['[PATCH]', '[MINOR]', '[MAJOR]'];
        for (var i = 0; i < increments.length; i++) {
            if (lastCommit.subject.includes(increments[i]))
                return increments[i].replace(/[\][]/g, '').toLowerCase(); // If multiple increments are provided, the smallest update will be chosen.
        }
        throw 'No versioning increment provided in git commit. this must be one of the following: [PATCH] [MINOR] [MAJOR]'
    } catch (err) {
        console.error(err);
        process.exit(1)
    }
}

async function getLastCommitMessage() {
    return new Promise(function(resolve, reject) {
        git.getLastCommit(function(err, commit) {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            resolve(commit);
        });
    });
}