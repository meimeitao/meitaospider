var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    loadPlugins: false
  },
  timeout: 300000 //MS 5mins
});
var utils = require("utils");
var system = require('system');
var args = casper.cli.args;
var cartesianProduct = require('cartesian-product');

var url = args[0];

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});

function parseMoney(amount) {
  return Number(amount.replace(/[^0-9\.]+/g,""));
}

casper.start(url);

casper.then(function() {
  var properties = [], propertiesMapping = {}, propertiesAry = [];
  var primitivePriceCurrency = "GBP";
  
  var productData = this.evaluate(function() {
    return productData;
  });

  var tmpDimension = {};
  attributeLabel = 'size';
  tmpDimension['name'] = attributeLabel;
  tmpDimension['id'] = attributeLabel;
  tmpDimension['data'] = {};

  var tmpOptions = productData.items;
  var tmpProperties = [];
  for (var i = 0; i < tmpOptions.length; i++) {
    var tmpOption = tmpOptions[i];

    var tmpOptionVal = tmpOption[attributeLabel];

    var tmpDimensionObject = {
      desc: tmpOptionVal
      , demo: ""
      , sample: ""
      , primitive_price: 0
      , primitive_price_currency: primitivePriceCurrency
      , exID: tmpOptionVal
    };

    tmpDimension['data'][tmpOptionVal] = tmpDimensionObject;
    tmpProperties.push(tmpOptionVal);
    propertiesMapping[tmpOptionVal] = attributeLabel;
  }

  propertiesAry.push(tmpProperties);
  properties.push(tmpDimension);

  var stocks = [];
  var stockMapping = cartesianProduct(propertiesAry);
  for (var x in stockMapping) {
    var tmpRow = stockMapping[x];
    var tmpStock = {};
    for (var y in tmpRow) {
      var selectValue = tmpRow[y];
      var selector = properties[y].id;
      tmpStock[selector] = selectValue;
    }
    tmpStock['soldout'] = 1;
    stocks.push(tmpStock);
  }

  var tmpStock, stockValue, tmpTarget;
  for (var x in stocks) {
    tmpStock = stocks[x];
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
      stocks[x].soldout = 1;
    } else {
      stocks[x].soldout = 0;
    }
  }

  retData = {
    "properties": properties
    , "stocks": stocks
  };

});

casper.run(function() {
  utils.dump(retData);
  this.exit();
});
