const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const livereload = require('gulp-livereload');
const preprocess = require('gulp-preprocess');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const preprocessify = require('preprocessify');
const uglifyes = require('gulp-uglify-es').default;

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

module.exports = function() {
	console.log('seeing this')
    return [
        gulp.src([`./src/fonts/**/*`])
        .pipe(gulp.dest(`${config.dist}/css/fonts`))
    ];
}