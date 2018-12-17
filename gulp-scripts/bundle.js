const gulp = require('gulp');
const zip = require('gulp-jszip');

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

module.exports = function() {

    return gulp.src(`${config.dist}` + '/*')
        .pipe(zip({
            name: 'bundle.zip',
            outpath: './'
        }));
};