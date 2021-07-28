const featuredMeta = [{
  name: "HOT PICKS",
  intent: "success",
  entries: [
    "/doom-dec-1993/", 
    "/dune-ii-the-building-of-a-dynasty-dec-1992/",
    "/dangerous-dave-in-the-haunted-mansion-1991/",
    "/grand-theft-auto-1997/", 
    "/prince-of-persia-1990/",
    "/mortal-kombat-1993/", 
  ],
}, {
  name: "Action | Platform |Arcade",
  intent: "primary",
  entries: [
    "/out-of-this-world-1992/",
    "/disneys-aladdin-1994/",
    "/bomberman-1992/",
    "/earthworm-jim-nov-30-1995/",
    "/golden-axe-1990/",
    "/prince-of-persia-1990/",
    "/prince-of-persia-2-the-shadow-the-flame-1993/",
    "/prehistorik-1991/",
    "/prehistorik-2-1993/",
    "/dangerous-dave-in-the-haunted-mansion-1991/",
  ],
}, {
  name: "DOOM Like (FPS)",
  intent: "success",
  entries: [
    "/doom-ii-oct-10-1994/",
    "/wolfenstein-3d-may-05-1992/",
    "/the-ultimate-doom-1995/",
    "/doom-dec-1993/", 
  ]
}, {
  name: "Strategy | Simulation",
  intent: "primary",
  entries: [
    "/oregon-trail-deluxe-1992/",
    "/sim-city-1989/",
    "/sim-city-2000-1993/",
    "/command-conquer-sep-26-1995/",
    "/command-conquer-red-alert-nov-22-1996/",
  ]
}, {
  name: "X-COM",
  intent: "success",
  entries: [
    "/x-com-ufo-defense-1994/",
    "/x-com-terror-from-the-deep-1995/",
    "/x-com-apocalypse-jul-15-1997/",
  ]
}, {
  name: "Racing",
  intent: "primary",
  entries: [
    "/the-need-for-speed-sep-1995/", 
    "/indianapolis-500-the-simulation-dec-1989/",
    "/test-drive-dec-1987/",
  ]
}, {
  name: "Bonus",
  intent: "success",
  entries: [
    "/the-lost-vikings-1993/",
    "/kings-bounty-1990/",
    "/space-quest-chapter-i-the-sarien-encounter-oct-1986/",
    "/cd-man-version-2-0-jun-1989/",
    "/arkanoid-nov-1988/",
  ]
}];




module.exports = function(config) {
  config.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  config.addPassthroughCopy("resources");
  config.addPassthroughCopy(".well-known");

  config.addCollection("featured", function(collectionApi) {
    const all = collectionApi.getAll();
    const byUrl = {};
    const featured = [];

    for (const next of all) {
      byUrl[next.url] = next;
    }

    for (const next of featuredMeta) {
      const pages = [];
      for (const entry of next.entries) {
        const page = byUrl[entry];
        if (page === undefined) {
          throw new Error("Page with url '" + entry + "' not found!");
        }

        pages.push({
          title: page.data.shortTitle,
          screenshot: page.data.screenshots[0],
          url: entry,
        });
      }

      featured.push({
        name: next.name,
        intent: next.intent,
        pages,
      })
    }

    return featured;
  });

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