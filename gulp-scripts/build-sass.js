const gulp = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const livereload = require('gulp-livereload');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const replace = require('gulp-replace');
const request = require('request');
const through = require('through2');
const fs = require('fs');

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

const external = 'https://vds.creative-labs.io/css/creative.min.css';

module.exports = function() {
    return gulp.src(config.src + '/scss/**/*.scss')
        .pipe(gulpif(isEnvDev(), concat('styles.scss'), concat('vungle.min.scss')))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(!isEnvDev(), replace('img/', '')))
        .pipe(gulpif(!isEnvDev(), cleanCSS()))
        .pipe(gulpif(isEnvDev(), gulp.dest(config.dist + '/css'), gulp.dest(config.dist)))
        .pipe(gulpif(!isEnvDev(), through.obj(function (chunk, enc, cb) {
          request(external, (error, response, body) => {
            fs.appendFile('./dist/vungle.min.css', response.body.toString(), 'utf8', (err) => {
              if (err) throw err;
              cb(null, chunk);
            });
          });
        })))
        .pipe(livereload());
}
