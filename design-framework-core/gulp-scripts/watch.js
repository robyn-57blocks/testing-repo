const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync').create();

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

module.exports = function() {

    var debounce1 = false;
    var debounce2 = false;

    var debounceTime = 25;
    var debounceDelay = 0;

    watch([
        config.src + '/**/*'
    ], async function() {

        if(debounce1 === true) {
            // fire only once for when tons of files are copied at once
            return;
        }

        debounce1 = true;

        await sleep(debounceTime);

        debounce1 = false;

        await sleep(debounceDelay);

        gulp.start('build:all');

        console.log('watch main called');
    });

    browserSync.init({
        port: 8080,
        open: 'local',
        startPath: "/index.html",
        notify: false,
        files: [`${config.dist}/`],
        server: config.dist
    });
};


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}