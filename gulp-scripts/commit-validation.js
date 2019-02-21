var fs = require('fs-extra');
     const commitMessage = fs.readFile('./git/COMMIT_EDITMSG');
     console.log(commitMessage)
     console.error('works');
     fail();

