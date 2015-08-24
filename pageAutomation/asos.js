var casper = require('casper').create({{
  pageSettings: {
    loadImages:  false,
    loadPlugins: false
  },
  timeout: 300000 //MS 5mins
}});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;

var url = args[0];
var stockMapping = JSON.parse(args[1]);

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});

casper.start(url);
casper.then(function(term) {
  var tmpStock, stockValue, tmpTarget, mapping = [], notAvailable;
  for (var x in stockMapping) {
    tmpStock = stockMapping[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      notAvailable = this.evaluate(function setProperties(id, value) {
        var ele = document.getElementById(id);
        var opts = ele.options;
        for (var optIndex in opts) {
          if (opts[optIndex].value == value) {
            if (opts[optIndex].text.indexOf("Not available") > -1) {
              return true;
            }
          }
        }
        return false;
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    if (notAvailable) {
      stockMapping[x].soldout = 1;
      mapping.push(stockMapping[x]);
    } else {
      stockMapping[x].soldout = 0;
      mapping.push(stockMapping[x]);
    }
  }
  utils.dump(mapping);
});

casper.run(function() {
    //this.debugPage();
    this.exit();
});
