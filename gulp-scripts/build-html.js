const gulp = require('gulp');
const gulpif = require('gulp-if');
const compileHandlebars = require('gulp-compile-handlebars');
const processhtml = require('gulp-processhtml');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const prettify = require('gulp-html-prettify');

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

const templateVariables = {
    version: require('../package.json').version
}

module.exports = function() {
    gulp.src(config.src + '/*.html')
        .pipe(gulpif(!isEnvDev(), processhtml({})))
        .pipe(gulp.dest(config.dist))

    return gulp.src(`${config.src}/index.hbs`)
        .pipe(compileHandlebars(templateVariables, {
            ignorePartials: true,
            batch: ['./src/components']
        }))
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(gulpif(!isEnvDev(), processhtml({})))
        .pipe(prettify({ indent_char: ' ', indent_size: 2 }))
        .pipe(gulp.dest(config.dist));
};
