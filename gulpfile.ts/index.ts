import browserify from "browserify";
import { src, dest, parallel } from "gulp";
import size from "gulp-size";
import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import cleanCss from "gulp-clean-css";
import concat from "gulp-concat";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

// eslint-disable-next-line
const tsify = require("tsify");

function minifyCss() {
    return src([
        "node_modules/normalize.css/normalize.css",
        "node_modules/@blueprintjs/core/lib/css/blueprint.css",
        "node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css",
        "node_modules/@blueprintjs/select/lib/css/blueprint-select.css",
        "src/style.css",
    ])
        .pipe(cleanCss())
        .pipe(concat("index.css"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("_site/resources"));
}

function compileJs() {
    return browserify({
        debug: true,
        basedir: ".",
        entries: ["src/index.ts"],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, {
            "target": "esnext",
        })
        .transform('babelify', {
            presets: [['@babel/preset-env', { 'useBuiltIns': 'usage', 'corejs': 3 }]],
            extensions: ['.ts']
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

exports.default = parallel(compileJs, minifyCss);
exports.js = compileJs;
exports.css = minifyCss;
