"use strict";

const path = require("path");
const webpack = require("webpack");
const fs = require("fs-extra");
const chalk = require("chalk");
const config = require("./config");
const deepmerge = require("deepmerge");
const isPlainObject = require("is-plain-object");
const archiver = require("archiver");
const AWS = require("aws-sdk");
const { format } = require("date-fns");
// const zlib = require("zlib");
const ajv = new require("ajv")();

const __processDir = process.env.PWD || process.cwd();

try {
    require("dotenv").config({
        path: normalizeAdUnitPath("/.env"),
    });
} catch (x) {} // eslint-disable-line

function getAdUnitConfig() {
    return require(normalizeAdUnitPath(`${config.baseDir}/${config.adUnitConfigFile}`));
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

function getVungleAdConfig() {
    const filename = normalizeAdUnitPath(config.vungleConfigFilename);
    return require(filename);
}

function getAdUnitName() {
    return getVungleAdConfig().name;
}

function normalizeAdUnitPath(dir) {
    return path.join(__processDir, dir);
}

async function clean(mode) {
    if (mode === "dist") {
        return fs.emptyDirSync(normalizeAdUnitPath(`${config.outputDir}`));
    }
    if (mode === "release") {
        return fs.emptyDirSync(normalizeAdUnitPath(`${config.releaseDir}`));
    }
}

async function buildJS() {
    return new Promise((resolve) => {
        const webpackBase = requireUncached("./webpack.base.js");
        const adUnitConfig = getVungleAdConfig();
        const adUnitWebpackConfig = deepmerge(
            Object.assign({}, webpackBase),
            adUnitConfig.webpack || {},
            { isMergeableObject: isPlainObject }
        );

        const jsRules = ["babel-loader", "eslint-loader"];
        if ("babel" in adUnitConfig) {
            adUnitWebpackConfig.module.rules.forEach((rule) => {
                if (jsRules.indexOf(rule.loader) === -1) {
                    return;
                }

                adUnitConfig.babel.forEach((babelOption) => {
                    rule.exclude = new RegExp(
                        rule.exclude
                            .toString()
                            .replace(
                                /vungle-dynamo-core/g,
                                `vungle-dynamo-core|${babelOption.exclude}`
                            )
                    );
                    rule.include = [...rule.include, ...babelOption.include];
                });
            });
        }

        webpack(adUnitWebpackConfig, function (err, stats) {
            if (err) throw err;
            process.stdout.write(
                stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false,
                }) + "\n\n"
            );
            resolve();
        });
    });
}

async function zipBundle(adUnitName) {
    if (config.configOnly) {
        // Copy adUnitConfig.json
        await fs.copySync(
            normalizeAdUnitPath(`${config.baseDir}/${config.adUnitConfigFile}`),
            normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}/${config.adUnitConfigFile}`)
        );

        // Zip the bundle
        await bestZip(
            normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}`),
            normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}.zip`)
        );

        return "success";
    }

    //Copy HTML
    await fs.copySync(
        normalizeAdUnitPath(`${config.outputDir}/index.html`),
        normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}/index.html`)
    );

    if (process.env.NODE_DEBUG === "true") {
        // Copy Eruda
        await fs.copySync(
            normalizeAdUnitPath(`${config.outputDir}/eruda.js`),
            normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}/eruda.js`)
        );
    }

    // Copy Mraid
    await fs.copySync(
        normalizeAdUnitPath(`${config.outputDir}/mraid.js`),
        normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}/mraid.js`)
    );

    // Copy adUnitConfig.json
    await fs.copySync(
        normalizeAdUnitPath(`${config.outputDir}/${config.adUnitConfigFile}`),
        normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}/adUnitConfig.json`)
    );

    await fs.ensureDirSync(normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}/js`));

    // Zip the bundle
    await bestZip(
        normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}`),
        normalizeAdUnitPath(`${config.releaseDir}/${adUnitName}.zip`)
    );
    // Remove ad unit folder in release
    // await fs.remove(normalizeAdUnitPath(`${config.releaseDir}/${unitName}`));
    return "success";
}

async function build() {
    // console.info("Cleaning Output.."); //eslint-disable-line
    // await clean();
    const adUnitName = getAdUnitName();

    await clean(config.releaseDir);

    await bundle();
    console.log(`${chalk.cyan("[BUILD:ZIP]")}: ${adUnitName}`); //eslint-disable-line
    await zipBundle(adUnitName);

    if (adUnitName.match(/native*/g) !== null) {
        process.env.FLEX_FEED = true;
        await bundle();
        await zipBundle(`${adUnitName}_Flexfeed`);
        console.log(`${chalk.cyan("[BUILD:ZIP]")}: ${adUnitName}_Flexfeed`); //eslint-disable-line
    }

    console.log(`${chalk.green("[BUILD:ZIP:SUCCESS]")}: ${adUnitName}`); //eslint-disable-line

    return "success";
}

async function bundle() {
    console.log(`${chalk.cyan("[BUILD:BUNDLE]")}: ...`); //eslint-disable-line

    await fs.ensureDirSync(normalizeAdUnitPath(`${config.outputDir}`));

    if (!config.configOnly) {
        await buildJS();
    }

    console.log(`${chalk.green("[BUILD:BUNDLE:SUCCESS]")}`); //eslint-disable-line

    return "success";
}

async function validate() {
    const defAdConfigSchema = require(normalizeAdUnitPath(
        "node_modules/vungle-dynamo-core/src/tokens/adUnitConfigModule.js"
    ));
    const customAdUnitTokens = getVungleAdConfig().custom_tokens || [];
    const adUnitConfigSchema = defAdConfigSchema.generateConfigSchema(customAdUnitTokens);

    const valid = ajv.validate(adUnitConfigSchema, getAdUnitConfig());

    if (!valid) {
        throw ajv.errors;
    }

    return true;
}

async function bestZip(srcFolder, zipFilePath) {
    return new Promise((resolve, reject) => {
        zipFolder(srcFolder, zipFilePath, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

function zipFolder(srcFolder, zipFilePath, callback) {
    fs.access(srcFolder, fs.constants.F_OK, (notExistingError) => {
        if (notExistingError) {
            callback(notExistingError);
        }
        var output = fs.createWriteStream(zipFilePath);
        var zipArchive = archiver("zip", {
            zlib: { level: 9 }, // Sets the compression level.
        });

        output.on("close", function () {
            callback();
        });

        zipArchive.pipe(output);
        zipArchive.directory(srcFolder, false);
        zipArchive.finalize();
    });
}

async function uploadToS3(awsObj, zipFile) {
    const filePth = normalizeAdUnitPath(`${config.releaseDir}/${zipFile}`);

    let data = [];

    const d = await fs.readFileSync(filePth);
    data.push({
        data: d,
        pth: filePth,
        filename: zipFile,
    });

    console.log(
        `${chalk.blue("[AWS:UPLOAD:AUTH]")}: Bucket: ${awsObj.bucket}, Folder: ${awsObj.folder}`
    );

    const s3 = new AWS.S3(awsObj.auth);

    return Promise.all(
        data.map((fObj) => {
            const fData = fObj.data;
            const fPth = fObj.pth;

            const uploadPath = fPth
                .replace(normalizeAdUnitPath(`${config.releaseDir}/`), awsObj.folder || "")
                .replace(new RegExp("\\\\", "g"), "/");

            const copyPath = `${awsObj.folder}/${format(
                new Date(),
                "D of MMMM YYYY, HH:mm:ss"
            )}/${zipFile}`
                .replace(`${awsObj.folder}/`, awsObj.folder || "")
                .replace(new RegExp("\\\\", "g"), "/");

            return new Promise((resolve, reject) => {
                s3.copyObject(
                    {
                        // ACL: "public-read",
                        Bucket: awsObj.bucket,
                        CopySource: `${awsObj.bucket}/${uploadPath}`,
                        Key: copyPath,
                    },
                    function (err) {
                        if (err && err.statusCode !== 404) {
                            return reject(err);
                        }

                        console.log(
                            `${chalk.blue("[AWS:COPY:STATUS]")} ${chalk.grey(
                                `${awsObj.bucket}/${uploadPath}`
                            )} ${chalk.blue(" -> ")} ${awsObj.bucket}/${copyPath}`
                        ); // eslint-disable-line

                        s3.putObject(
                            {
                                Body: fData,
                                ACL: "public-read",
                                Bucket: awsObj.bucket,
                                Key: uploadPath,
                            },
                            function (resp) {
                                if (resp) {
                                    return reject(resp);
                                }

                                console.log(
                                    `${chalk.blue("[AWS:UPLOAD:STATUS]")} ${chalk.grey(
                                        fPth
                                    )} ${chalk.blue(" -> ")} ${awsObj.bucket}/${uploadPath}`
                                ); // eslint-disable-line

                                resolve({
                                    message: "Success",
                                    s3pth: `${awsObj.bucket}/${uploadPath}`,
                                    filepth: fPth,
                                    filename: fObj.filename,
                                });
                            }
                        );
                    }
                );
            });
        })
    );
}

module.exports = {
    clean,
    bundle,
    build,
    zipBundle,
    validate,
    requireUncached,
    bestZip,
    uploadToS3,
};
