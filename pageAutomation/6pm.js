var casper = require('casper').create({
  //clientScripts: ["/Users/Dya/Projects/meitaosite/public/javascripts/jquery-1.9.0.min.js"]
});
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
  var tmpStock, stockValue, tmpTarget, mapping = [];
  for (var x in stockMapping) {
    tmpStock = stockMapping[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      this.evaluate(function setProperties(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('change', true, false);
        var ele = document.getElementById(id);
        var opts = ele.options;
        var selectedIndex;
        for (var optIndex in opts) {
          if (opts[optIndex].value == value) {
            selectedIndex = opts[optIndex].index;
            break;
          }
        }
        ele.selectedIndex = selectedIndex;
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    stockValue = this.evaluate(function getStockStatus() {
      return document.querySelector("#addToCart").getAttribute("disabled");
    });
    if (stockValue == 'disabled') {
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
