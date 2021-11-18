"use strict";

const path = require("path");
const ConcatPlugin = require("webpack-concat-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const config = require("./config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin");
const branchName = require("current-git-branch");
const { execSync } = require("child_process");
const { format } = require("date-fns");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;
const os = require("os");
const fs = require("fs");

const __processDir = process.env.PWD || process.cwd();

function normalizeAdUnitPath(dir) {
    return fs.realpathSync(path.join(__processDir, dir));
}

function normalizePath(dir) {
    return fs.realpathSync(path.join(__dirname, "../", dir));
}

function requireUncached(module){
    delete require.cache[require.resolve(module)];
    return require(module);
}

const adUnitPackageJSON = requireUncached(normalizeAdUnitPath("package.json"));
const vungleConfig = requireUncached(normalizeAdUnitPath(config.vungleConfigFilename));

if (!vungleConfig.placementType) {
    throw new Error(`Missing placementType in vungle config, path: ${config.vungleConfigFilename}` );
}

if (!["fullscreen", "mrec", "banner"].includes(vungleConfig.placementType)) {
    throw new Error(`placementType in vungle config must be one of the following strings: "fullscreen", "mrec", "banner". found ${vungleConfig.placementType} ` );
}


const cliVersion = require(normalizePath("package.json")).version;
const adUnitCurrentBranch = branchName({ altPath: normalizeAdUnitPath("") });
const cliCurrentBranch = branchName({ altPath: normalizePath("") });
let adUnitRevision = null;

try {
    adUnitRevision = execSync(`git -C ${normalizeAdUnitPath("")} rev-parse HEAD`).toString().trim();
} catch (x) {} //eslint-disable-line

let copyArr = [
    { from: normalizeAdUnitPath("/node_modules/eruda/eruda.js"), to: "" },
    { from:
        normalizeAdUnitPath("/node_modules/vungle-dynamo-core/src/tokens/baseTokens.dev.js"), to: "" },
    { from: normalizeAdUnitPath(`${config.baseDir}/${config.adUnitConfigFile}`), to: "" }
];


// SDK's overwrite mraid.js of template with Vungle mraid.js
if (process.env.NODE_COMMAND === "serve") {
    copyArr.push({ from: normalizeAdUnitPath("/node_modules/vungle-mraid/dist/vungle.mraid.min.js"), to: "./mraid.js" });
} else {
    copyArr.push({ from: normalizeAdUnitPath("/node_modules/vungle-mraid/dist/mraid.js"), to: "" });
}

// OMSDK libraries
if (process.env.NODE_OMSDK) {
    try {
        copyArr.push({ from: normalizeAdUnitPath("/node_modules/omsdk/src/omsdk.js"), to: "" });
        copyArr.push({ from: normalizeAdUnitPath("/node_modules/omsdk/src/omsdk-session.js"), to: "" });
        copyArr.push({ from: normalizeAdUnitPath("/node_modules/vungle-dynamo-core/src/omsdk-data/baseData.dev.js"), to: "" });
  } catch (x) { } //eslint-disable-line
}

try {
    copyArr.push({ from: normalizeAdUnitPath("/node_modules/vungle-dynamo-i18n/data/i18n.js"), to: "data" });
} catch (x) { } //eslint-disable-line

// <= 1.8.0
try {
    copyArr.push({ from: normalizeAdUnitPath(`${config.baseDir}/tokensDev.js`), to: "" });
} catch (x) { } //eslint-disable-line

// 1.9.0 +
try {
    copyArr.push({ from: normalizeAdUnitPath(`${config.baseDir}/dev.js`), to: "" });
} catch(x) {} //eslint-disable-line

let rules = [
    {
        test: /\.hbs$/,
        loader: "hbs-loader"
    },
    {
        test: /\.js$/,
        exclude: /node_modules\/(?!(vungle-dynamo-core)\/).*/,
        include: [
            normalizeAdUnitPath("node_modules/vungle-dynamo-core/src"),
            normalizeAdUnitPath(`${config.baseDir}`),
        ],
        loader: "babel-loader",
        options: {
            presets: [
                [require.resolve(normalizePath("node_modules/@babel/preset-env"))]
            ]
        }
    },
    {
        test: [/.css$|.scss$/],
        use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
                loader: "postcss-loader",
                options: {
                    ident: "postcss",
                    plugins: [
                        require(normalizePath("node_modules/autoprefixer"))({
                            overrideBrowserslist: ["last 5 versions", "IE 10", "IE 11", "firefox 20", "ios_saf 8.4", "android 4.3"]
                        })
                    ]
                }
            },
            {
                loader: "sass-loader",
                options: {
                    includePaths: [
                        normalizeAdUnitPath("node_modules/foundation-sites/scss"),
                        normalizeAdUnitPath("node_modules/vungle-dynamo-core/src/sass")
                    ]
                }
            },
        ]
    },
    {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: "file-loader",
            options: {
                includePaths: [
                    normalizeAdUnitPath("node_modules/vungle-dynamo-core/src/sass")
                ]
            }
        }]
    }
];

if (process.env.NODE_ENV === "development") {
    rules.push({
        test: /\.js$/,
        loader: "eslint-loader",
        enforce: "pre",
        exclude: /node_modules\/(?!(vungle-dynamo-core)\/).*/,
        include: [
            normalizeAdUnitPath("node_modules/vungle-dynamo-core/src"),
            normalizeAdUnitPath(`${config.baseDir}`),
        ],
        options: {
            formatter: "eslint-friendly-formatter"
        }
    });
}

module.exports = {
    // debug: true,
    watch: ["development", "testing"].indexOf(process.env.NODE_ENV) !== -1,
    context: normalizeAdUnitPath(`${config.baseDir}`),
    entry: {
        "vungle-main": normalizeAdUnitPath(`${config.baseDir}/vungle.main.js`)
    },
    output: {
        filename: "vungle.main.min.js", //"vungle.main.min.js",
        path: normalizeAdUnitPath(`${config.outputDir}/`)
    },
    mode: ["production", "testing"].indexOf(process.env.NODE_ENV) !== -1 ? "production" : "development",
    resolve: {
        extensions: [".js", ".json"],
        alias: {
            "dynamo-core": normalizeAdUnitPath("/node_modules/vungle-dynamo-core/src")
        }
    },
    resolveLoader: {
        modules: [normalizePath("/node_modules/"), normalizePath("/build/loaders")]
    },
    optimization: {
        // We no not want to minimize our code.
        minimize: ["production"].indexOf(process.env.NODE_ENV) !== -1
    },
    // devtool: "inline-source-map",
    module: {
        rules: rules
    },
    plugins: [
        new CopyWebpackPlugin(copyArr),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            // Load a custom template (lodash by default)
            template: normalizeAdUnitPath("/node_modules/vungle-dynamo-core/src/index.html"),
            filename: "index.html",
            inject: false,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                NODE_DEBUG: process.env.NODE_DEBUG,
                NODE_OMSDK: process.env.NODE_OMSDK,

                TPL_VERSION: `${adUnitPackageJSON.name}: ${adUnitPackageJSON.version}, Branch: ${adUnitCurrentBranch}, Revision: ${adUnitRevision}`,
                CLI_VERSION: `CLI: ${cliVersion}, Branch: ${cliCurrentBranch}`,
                DEPENDENCIES: `${Object.keys(adUnitPackageJSON.dependencies).map(dependency => {
                    const branch = adUnitPackageJSON.dependencies[dependency].match(/#(.*)/i);
                    const dVersion = requireUncached(normalizeAdUnitPath(`node_modules/${dependency}/package.json`)).version;
                    return `${dependency}: ${dVersion}, Branch: ${(branch && branch[1]) || adUnitPackageJSON.dependencies[dependency]}`;
                }).join(", ")}`,
                CREATED_AT: format(new Date(), "D of MMMM YYYY, HH:mm:ss"),
                OS_USER: os.hostname(),

                I18N_CDN: process.env.I18N_CDN,
                FLEX_FEED: typeof process.env.FLEX_FEED === "undefined" ? false : process.env.FLEX_FEED,
                PLACEMENT_TYPE: vungleConfig.placementType
            }
        }),
        new ConcatPlugin({
            uglify: true,
            sourceMap: false,
            // injectType: "none",
            name: "vungle.third-party",
            // outputPath: "/js", // this has to be disabled to have inline working
            fileName: "[name].min.js",
            filesToConcat: [
                normalizeAdUnitPath("/node_modules/element-closest/element-closest.js"),
                normalizeAdUnitPath("/node_modules/matchmedia-polyfill/matchMedia.js"),
                normalizeAdUnitPath("/node_modules/handlebars/dist/handlebars.runtime.js")
            ],
            attributes: {
                async: true
            }
        }),
        new OptimizeCSSAssetsPlugin({
            cssProcessorPluginOptions: {
                preset: ["default", { discardComments: { removeAll: true } }],
            },
            canPrint: true
        }),
        new HTMLInlineCSSWebpackPlugin({
            replace: {
                removeTarget: true,
                target: "<!-- inline_css_plugin -->",
            },
        }),
        new Visualizer({
            filename: "./statistics.html"
        }),
        new BrowserSyncPlugin({
            port: Number(process.env.DEV_PORT),
            open: process.env.DEV_OPEN === "true",
            ui: {
                port: Number(process.env.DEV_PORT_UI)
            },
            notify: false,
            server: {
                baseDir: normalizeAdUnitPath(`${config.outputDir}`),
                index: "index.html",
            }
        })
    ]
};
