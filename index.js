
var cheerio = require('cheerio');
var got = require('got')
var loki = require('lokijs')

var db = new loki('sandbox.db');

var urlRoot = "https://wiprodigital.com";

// Using in-memory database to keep track of which web links we have already visited 
// because this is visiting links recursively.

var webitems = db.addCollection('webitems');

var recursiveGet = function(urlParent, urlToFetch) {
    got(urlToFetch).then(response => {
      const $ = cheerio.load(response.body);
      // handle the links <a>
      $('a').each((i, link) => {
        const href = link.attribs.href;
        if (href.indexOf(urlRoot) == 0) {
          // internal link
          var existsitem = webitems.findOne({'url': href});
          if (existsitem === null){
            // this means that we havent visted that page yet.
            console.log("internal web : "   + href);
            webitems.insert({ urlparent : urlToFetch, url: href });
            recursiveGet(urlToFetch, href);
          }
          else {
            //console.log("already visited")
          }
        } else {
          console.log("web link external: " + href);
        }
      });
      // handle the images 
      $('img').each((i, link) => {
        const imageSrc = link.attribs.src;
        
        console.log("image src : " + imageSrc);
        
      });


    }).catch(err => {
      console.log(err);
    });
  
} 

webitems.insert({ urlparent : '', url: urlRoot });
recursiveGet("", urlRoot);

