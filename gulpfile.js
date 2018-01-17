'use strict';

const browserSync = require('browser-sync').create();
const del = require('del');
const newer = require('gulp-newer');
const gulp = require('gulp');
const sass = require('gulp-sass');
const env = require('gulp-util').env;
const compileHandlebars = require('gulp-compile-handlebars');
const handlebars = require('gulp-handlebars');
const rename = require('gulp-rename');
const declare = require('gulp-declare');
const concat = require('gulp-concat');
const execSync = require('child_process').execSync;
const fs = require('fs');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const pump = require('pump');
const zip = require('gulp-jszip');

const config = {
    src: './src',
    build: './build',
    dist: './dist',
    home: './',
    watchers: [{
        match: ['./src/*'],
        tasks: ['scss', 'js']
    }]
};

gulp.task('clean', () => {
    del(config.build);
    return del(config.dist);
})

gulp.task('watch', () => {
    config.watchers.forEach(item => {
        gulp.watch(item.match, item.tasks);
    });
});

gulp.task('build', ['html', 'scss', 'js'], () => {
    // build completed    
});

//This task will clean the build directory, check for updates and then watch file changes
gulp.task('default', ['clean'], done => {
    gulp.start('update');
    gulp.start('serve');
    gulp.start('watch');
});

//Copy index.hbs file to build folder
gulp.task('html', () => {
    return gulp.src(`${config.src}` + '/pages/**/*.hbs')
/*
        .pipe(compileHandlebars({}, {
            ignorePartials: false,
            batch: [`${config.src}`]
        }))
        .pipe(rename({
            extname: '.html'
        }))
*/
        .pipe(gulp.dest(config.build));
});

//Compile Sass files
gulp.task('scss', function() {
    return gulp.src([
            `${config.pages}/scss/*.scss`,
            `${config.src}` + '/scss/**/*.scss'
        ])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.build))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js', function() {
    return gulp.src([
            `${config.pages}/js/*.js`,
            `${config.src}` + '/js/**/*.js'
        ])
        .pipe(gulp.dest(config.build))
        .pipe(browserSync.reload({
            stream: true
        }));
});


//Minification and Prepare files for Production
gulp.task('htmlDest', function() {
    return gulp.src(`${config.build}` + '/*.hbs')
        .pipe(gulp.dest(`${config.dist}/pages`));
});

gulp.task('cssMin', function() {
    return gulp.src(`${config.build}` + '/*.css')
        .pipe(concat('vungle.min.css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest(`${config.dist}/scss`));
});

gulp.task('jsMin', function(cb) {
    pump([
            gulp.src(`${config.build}` + '/*.js'),
            concat('vungle.min.js'),
            uglify(),
            gulp.dest(`${config.dist}/js`)
        ],
        cb
    );
});


//Prepare Framework for Production
gulp.task('dist', ['clean', 'build'], done => {
    gulp.start('minifyDist');
});


//Minify JS, CSS and copy index.hbs to dist folder
gulp.task('minifyDist', ['htmlDest', 'jsMin', 'cssMin']);


//Runs Browser Sync on port 8080 once updated files are in the build directory
gulp.task('serve', ['build'], () => {
    browserSync.init({
        port: 8080,
        open: false,
        notify: false,
        files: [`${config.build}`],
        server: config.build
    });
});