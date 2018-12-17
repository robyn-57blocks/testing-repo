const gulp = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const livereload = require('gulp-livereload');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const replace = require('gulp-replace');

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

module.exports = function() {
	
    return gulp.src(config.src + '/scss/**/*.scss')
        .pipe(gulpif(isEnvDev(), concat('styles.scss'), concat('vungle.min.scss')))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(!isEnvDev(), replace('img/', '')))
        .pipe(gulpif(!isEnvDev(), cleanCSS()))
        .pipe(gulpif(isEnvDev(), gulp.dest(config.dist + '/css'), gulp.dest(config.dist)))
        .pipe(livereload());
}