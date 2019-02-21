var fs = require('fs-extra');
    const commitMessage = await fs.readFileSync('./git/COMMIT_EDITMSG');
    console.log(commitMessage)
    console.error('works');
    fail();