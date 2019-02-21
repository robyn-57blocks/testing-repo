var fs = require('fs-extra');
const commitMessage = fs.readFileSync('./git/COMMIT_EDITMSG', 'utf8');
console.log(commitMessage)