"use strict";

const UglifyJs = require("uglify-js");
const handlebars = require("handlebars");
const declare = require("nsdeclare");

module.exports = function(source) {
    // const options = getOptions(this);

    // validateOptions(schema, options, "hbs-loader");
    const tplNameArr = source.toString().match(/data-hbs-name="(.*?)"/i);

    if (!tplNameArr) {
        throw new Error("data-hbs-name is missing");
    }

    const template = handlebars.precompile(source).toString();
    const wrap = `Handlebars.template(${template})`;
    const hbsName = tplNameArr[1];
    const name = `vungle.templates.${hbsName}.template`;
    const output = declare(name, {
        declared: null,
        value: wrap,
        separator: "\n",
        root: "window"
    });

    return UglifyJs.minify(output).code;
};
