const fs = require('fs-extra')
const semver = require('semver');
const git = require('git-last-commit');

const checkedBranch = 'development'

getNewVersion();

async function getNewVersion() {
    let lastCommit = await getLastCommitMessage()
    console.log(lastCommit);
    if (lastCommit.notes === checkedBranch || lastCommit.branch === checkedBranch) {

        console.log('Branch is ' + checkedBranch);

        let pkg = await fs.readJson('./package.json')
        let increment = await getIncrement(lastCommit)
        let newVersion = semver.inc(pkg.version, increment) || pkg.version;
        pkg.version = newVersion
        await fs.writeJson(`./package.json`, pkg, { spaces: 2 })
    }
}


async function getIncrement(lastCommit) {

    try {
        const increments = ['[PATCH]', '[MINOR]', '[MAJOR]'];
        for (var i = 0; i < increments.length; i++) {
            if (lastCommit.subject.includes(increments[i])) {
                console.log('Applying ' + increments[i]);
                return increments[i].replace(/[\][]/g, '').toLowerCase(); // If multiple increments are provided, the smallest update will be chosen.
            }
        }
        console.error('cannot find increment in commit message');
        console.error(lastCommit.subject);
        process.exit(1)
        throw 'No versioning increment provided in git commit. this must be one of the following: [PATCH] [MINOR] [MAJOR]'
    } catch (err) {
        process.exit(1)
        console.error(err);
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