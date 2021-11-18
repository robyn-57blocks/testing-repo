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

    if (isEnvDev()) {
        return [
            gulp.src(config.src + '/js/**/*.js')
            .pipe(preprocess({context: { NODE_ENV: isEnvDev() ? 'dev': 'prod'}}))
            .pipe(gulp.dest(config.dist + '/js'))
        ];
    }

    return browserify({ entries: config.src + '/js/main.js' })
        .transform("babelify", {
            presets: ["es2015"],
            global: true
        })
        .transform(preprocessify, {
            context: { NODE_ENV: isEnvDev() ? 'dev': 'prod'}
        })
        .bundle()
        .pipe(source(config.src + '/js/main.js'))
        .pipe(rename(function(path) {
            path.basename = 'vungle';
            path.dirname = '/';
            path.extname = '.min.js';
        }))
        .pipe(buffer())
        .pipe(uglifyes())
        .pipe(gulp.dest(config.dist))
        .pipe(livereload());
}