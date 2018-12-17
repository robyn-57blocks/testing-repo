const gulp = require('gulp');
const gulpif = require('gulp-if');
const replace = require('gulp-replace');
const fs = require('fs-extra');

// gulp scripts
const isEnvDev = require('./env.js').isEnvDev;
const config = require('./config.js');

module.exports = async function() {

    if (isEnvDev() === false) {

        var vungleJsName = '/vungle.min.js';
        var vungleCssName = '/vungle.min.css';

        var dir = config.dist.replace('.', '');

        var indexHtml = await fs.readFile(config.dist + '/index.html', 'utf8');
        var vungleJs = await fs.readFile(config.dist + vungleJsName, 'utf8');
        var vungleCss = await fs.readFile(config.dist + vungleCssName, 'utf8');

        var token1 = '<script src="vungle.min.js"></script>';
        var token2 = '<link rel="stylesheet" href="vungle.min.css">';

        indexHtml = indexHtml.replace(token1, '<script>' + vungleJs + '</script>');
        indexHtml = indexHtml.replace(token2, '<style>' + vungleCss + '</style>');

        await fs.remove(config.dist + vungleJsName);
        await fs.remove(config.dist + vungleCssName);

        await fs.writeFile(config.dist + '/index.html', indexHtml);
    }
}