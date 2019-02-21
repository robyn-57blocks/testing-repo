var vs = require('fs');
module.exports.validate = async function(cb) {
     const commitMessage = fs.readFileSync('./git/COMMIT_EDITMSG', 'utf8');
     console.log('##############')
     console.log(commitMessage)
     console.log('##############')
}
