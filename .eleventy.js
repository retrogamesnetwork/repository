module.exports = function(config) {
  config.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  config.addPassthroughCopy("resources");

  config.addCollection("games", function(collectionApi) {
    return collectionApi.getAll().sort((itemA, itemB) => {
      const a = itemA.data.title;
      const b = itemB.data.title;
      
      if (a > b) {
        return 1;
      }

      if (a < b) {
        return -1;
      }

      return 0;
    });
  });
}