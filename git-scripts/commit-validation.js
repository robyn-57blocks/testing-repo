const fs = require('fs-extra');
const { execSync } = require("child_process");
const commitMessage = execSync("git log -1 --pretty=%B").toString().trim();
const head = fs.readFileSync('./.git/HEAD', 'utf8');
const branch = head.substring(head.lastIndexOf('/') + 1, head.length).trim() || head.trim();
if (branch === "master"  &&  !commitMessage.includes('[skip CI]')) {
    const increments = ['[PATCH]', '[MINOR]', '[MAJOR]'];
    let counter = 0;
    let pointer;
    for (var i = 0; i < increments.length; i++) {
        if (commitMessage.includes(increments[i])) {
            counter++;
            pointer = i;
        }
    }
    if (counter === 0) {
        console.error('Provide a versioning increment, this can be: [PATCH] [MINOR] [MAJOR]')
        process.exit(1)
    }
    if (counter === 1) {
        console.log('Recieved versioning increment: ' + increments[pointer]);
        process.exit(0)
    }
    if (counter > 1) {
        console.error('Only one versioning increment must be supplied in the commit message')
        process.exit(1)
    }
}