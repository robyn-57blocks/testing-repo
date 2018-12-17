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

module.exports = function() {
    gulp.src(config.src + '/*.html')
        .pipe(gulp.dest(config.dist))

    return gulp.src(`${config.src}/index.hbs`)
        .pipe(compileHandlebars({}, {
            ignorePartials: true,
            // batch: [`${config.templates}`]
        }))
        .pipe(rename({
            extname: '.html'
        }))
        //.pipe(gulpif(!isEnvDev(), replace('img/', '')))
        .pipe(gulpif(!isEnvDev(), processhtml({})))
        .pipe(prettify({ indent_char: ' ', indent_size: 2 }))
        .pipe(gulp.dest(config.dist));
};