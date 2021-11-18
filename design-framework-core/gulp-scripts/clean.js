
const gulp = require('gulp');
const clean = require('gulp-clean');

const config = require('./config.js');

module.exports = function() {
    return gulp.src([config.dist])
        .pipe(clean());
};