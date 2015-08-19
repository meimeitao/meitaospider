var casper = require('casper').create();
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
      stockValue = this.evaluate(function(id, value) {
        var ele = document.querySelector("[data-size='"+value+"']");
        return ele.className == 'stock_zero' ? true : false;
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    if (stockValue) {
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
