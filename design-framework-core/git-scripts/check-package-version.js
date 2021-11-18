const fs = require('fs-extra');
const gittags = require('git-tags');

gittags.get(function(err, tags) {
  if (err) throw err;
 
  console.log(tags[0]);
  // ['1.0.1', '1.0.0', '0.1.0-beta']
});





