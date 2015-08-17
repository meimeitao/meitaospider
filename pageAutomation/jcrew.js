var casper = require('casper').create({});
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

casper.then(function() {
  var tmpStock, stockValue, tmpTarget, mapping = [];
  for (var x in stockMapping) {
    tmpStock = stockMapping[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      this.evaluate(function setProperties(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele;
        if (id == "color1") {
          ele = document.querySelector("#"+id+" .color-box[data-color='"+value+"']");
        } else if (id == "sizes0") {
          ele = document.querySelector("#"+id+" .size-box[data-size='"+value+"']");
        }
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    stockValue = this.evaluate(function getStockStatus() {
      return document.querySelector(".add-item").text;
    });
    if (stockValue.toLowerCase() == 'out of stock') {
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
