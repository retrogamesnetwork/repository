const featuredMeta = [{
  name: "HOT PICKS",
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
  entries: [
    "/doom-ii-oct-10-1994/",
    "/wolfenstein-3d-may-05-1992/",
    "/the-ultimate-doom-1995/",
    "/doom-dec-1993/", 
  ]
}, {
  name: "Strategy | Simulation",
  entries: [
    "/warcraft-orcs-humans/",
    "/heroes-of-might-and-magic-ii/",
    "/oregon-trail-deluxe-1992/",
    "/sim-city-1989/",
    "/sim-city-2000-1993/",
    "/command-conquer-sep-26-1995/",
    "/command-conquer-red-alert-nov-22-1996/",
  ]
}, {
  name: "X-COM",
  entries: [
    "/x-com-ufo-defense-1994/",
    "/x-com-terror-from-the-deep-1995/",
    "/x-com-apocalypse-jul-15-1997/",
  ]
}, {
  name: "Racing",
  entries: [
    "/the-need-for-speed-sep-1995/", 
    "/indianapolis-500-the-simulation-dec-1989/",
    "/test-drive-dec-1987/",
  ]
}, {
  name: "Bonus",
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
  config.addPassthroughCopy("robots.txt");

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
    return collectionApi.getFilteredByGlob("_pages/*.njk")
        .sort((a, b) => a.data.shortTitle.localeCompare(b.data.shortTitle));
  });

  config.addCollection("num", function(collectionApi) {
      return extractSymbolsCollection("&μÜ0123456789", collectionApi);
  });

  
  const letters = "qwertyuiopasdfghjklzxcvbnm";
  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    config.addCollection(letter, function(collectionApi) {
        return extractSymbolsCollection(letter, collectionApi);
    });
  }


  const rows = [
      "...",
      "0abcdef",
      "ghijklm",
      "nopqrst",
      "uvwxyz",
  ];
  config.addShortcode("navigator", function() {
    let contents = "";
    contents += `<div class="flex flex-col items-center">`;
    for (let row = 0; row < rows.length; ++row) {
        contents += `<div class="flex flex-row flex-wrap">`;
        if (row === 0) {
            contents += `
<div class="my-2 rounded-xl border-2 border-purple-400 bg-purple-100 cursor-pointer">
    <a class="font-bold text-lg text-purple-800 px-2 flex flex-row items-center" href="/mobile/">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Mobile
    </a>
</div>
<div class="ml-2 my-2 rounded-xl border-2 border-purple-400 bg-purple-100 cursor-pointer">
    <a class="font-bold text-lg text-purple-800 px-2 flex flex-row items-center" href="/multiplayer/">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Multiplayer
    </a>
</div>
            `;
        } else {
            for (let i = 0; i < rows[row].length; ++i) {
                const letter = rows[row][i];
                contents += `    
<div class="mx-1 my-2 rounded-xl border-2 border-blue-400 bg-blue-100 cursor-pointer">
    <a class="font-bold font-mono text-lg text-blue-800 px-2 uppercase" href="/starts/with/${letter === "0" ? "number" : letter}/">${letter}</a>
</div>
                `;
            }
        }
        contents += `</div>`;
    }
    contents += `</div>`;
    return contents;
  });
}

function extractSymbolsCollection(symbols, collectionApi) {
    const hash = {};
    
    for (const symbol of symbols) {
        hash[symbol] = true;
    }

    return collectionApi.getFilteredByGlob("_pages/*.njk").filter((v) => {
        return hash[v.data.shortTitle[0].toLowerCase()];
    }).sort((a, b) => a.data.shortTitle.localeCompare(b.data.shortTitle));
}