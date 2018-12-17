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
            // allow imports from node_modules 
            // see https://github.com/babel/babelify#why-arent-files-in-node_modules-being-transformed
            global: true
        })
        .bundle()
        .pipe(source(config.src + '/js/main.js'))
        .pipe(rename(function(path) {
            path.basename = 'vungle';
            path.dirname = '/';
            path.extname = '.min.js';
        }))
        .pipe(buffer())
        // .pipe(uglify())
        .pipe(gulp.dest(config.dist))
        .pipe(livereload());
}