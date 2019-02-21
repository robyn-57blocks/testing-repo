var fs = require('fs-extra');

(async () => {
    const commitMessage = await fs.readFile('./git/COMMIT_EDITMSG');
    console.log(commitMessage)
    console.error('works');
    fail();
})();