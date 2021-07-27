const CleanCSS = require("clean-css");
const { minify } = require("terser");

module.exports = function(config) {
  config.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  config.addPassthroughCopy("_assets");
}