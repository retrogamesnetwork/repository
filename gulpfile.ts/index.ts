import browserify from "browserify";
import { src, dest, parallel } from "gulp";
import size from "gulp-size";
import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";
import { execute } from "./execute";

// eslint-disable-next-line
const tsify = require("tsify");

async function css() {
    await execute("yarn", "run",
        "tailwindcss",
        "-i", "src/style.css",
        "-o", "build/index.css");

    return src("build/index.css")
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("_site/resources"));
}

function compileJs() {
    return browserify({
        debug: true,
        basedir: ".",
        entries: ["src/index.ts"],
    })
        .plugin(tsify, {
            "target": "esnext",
        })
        .transform("babelify", {
            presets: [["@babel/preset-env", { "useBuiltIns": "usage", "corejs": 3 }]],
            extensions: [".ts"],
        })
        .bundle()
        .pipe(source("index.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(terser())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("_site/resources"));
}

exports.default = parallel(compileJs, css);
exports.js = compileJs;
exports.css = css;
