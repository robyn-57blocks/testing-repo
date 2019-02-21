const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const version = require('./gulp-scripts/versioning');
const commitValidation = require('./gulp-scripts/commit-validation.js');

// gulp scripts
const { setEnvDev, setEnvProd } = require('./gulp-scripts/env.js');

gulp.task('set:env:dev', setEnvDev);
gulp.task('set:env:prod', setEnvProd);
//gulp.task('upversion', version.upversion);
//gulp.task('saveversion', version.saveversion);
//gulp.task('autoversion', version.autoversion);
gulp.task('clean', require('./gulp-scripts/clean.js'));
gulp.task('build:js', require('./gulp-scripts/build-js.js'));
gulp.task('build:resources', require('./gulp-scripts/build-resources.js'));
gulp.task('build:sass', require('./gulp-scripts/build-sass.js'));
gulp.task('build:html', require('./gulp-scripts/build-html.js'));
gulp.task('build:inline', require('./gulp-scripts/build-inline.js'));
gulp.task('gen:bundle', require('./gulp-scripts/bundle.js'));
gulp.task('watch', ['build'], require('./gulp-scripts/watch.js')); 

// BUILD TASKS
gulp.task('build', (cb) => { gulpSequence('clean', 'build:all')(cb) });
gulp.task('build:all', (cb) => {
    console.log('Building for '+process.env.NODE_ENV+' environment')
    gulpSequence([
        'build:html',
        'build:js',
        'build:sass'
    ])(cb)
});

// MAIN ACTIONS
gulp.task('default', gulpSequence('set:env:dev', 'watch'));
gulp.task('serve:prod', gulpSequence('set:env:prod', 'watch'));
gulp.task('bundle:prod', gulpSequence('set:env:prod', 'build', 'build:inline', 'build:resources', 'gen:bundle'));
gulp.task('bundle:pipelines-deploy', gulpSequence('set:env:prod', 'build', 'build:inline', 'build:resources', 'gen:bundle', version.getNewVersion));
gulp.task('bump:version', version.getNewVersion);

gulp.task('validate:prod', commitValidation.validate);

