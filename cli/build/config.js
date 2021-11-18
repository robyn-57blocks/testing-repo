"use strict";

module.exports = {
    vungleScssFile: "vungle.index.scss",
    scssDir: "sass",
    vungleCssFile: "vungle.index.min.css",
    outputCssDir: "css",
    outputDir: "dist",
    baseDir: "src",
    adUnitsDir: "adUnits",
    adUnitConfigFile: process.env.AD_UNIT_CONFIG || "adUnitConfig.json",
    vungleConfigFilename: process.env.VUNGLE_CONFIG || "vungle.config.js",
    outputJsDir: "js",

    pagesDir: "pages",
    pageScssFile: "style.scss",
    outputPagesDir: "pages",

    componentsDir: "pages",
    componentScssFile: "style.scss",
    outputComponentDir: "pages",

    hbsOutputDir: "pages",
    hbsInputFile: "template.hbs",
    releaseDir: "release",

    bundlesDir: ".bundles",
    tmpDir: ".tmp",

    slackToken: "xoxb-2339545092-570890183554-MhOj1h7SAdtF0CQbvVotvmqs",
    i18nCDN: "https://cdn-lb.vungle.com/template-localization/i18n.min.js",

    configOnly: !!process.env.CONFIG_ONLY,
};
