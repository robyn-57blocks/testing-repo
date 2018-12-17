const gulp = require('gulp');
const runSequence = require('run-sequence'); // Run tasks sequentially
const jsonModify = require('gulp-json-modify');

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

module.exports.upversion = function() {
    let ver = require('../package.json').version; //version defined in the package.json file

    let splitString = ver.split('.', 3)
    let patchVersion = splitString[2].split('"', 1)
    let patchNumber = Number(patchVersion[0])
    patchNumber++
    splitString[2] = String(patchNumber);
    process.env.VERSION = splitString.join('.');
    console.log(process.env.VERSION)
};

module.exports.saveversion = function() {
    return gulp.src(['./package.json'])
        .pipe(jsonModify({
            key: 'version',
            value: process.env.VERSION
        }))
        .pipe(gulp.dest('./'))
};

module.exports.autoversion = function () {

    runSequence('upversion','saveversion');
};