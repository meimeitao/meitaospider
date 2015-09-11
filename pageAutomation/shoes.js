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

function parseMoney(amount) {
  return Number(amount.replace(/[^0-9\.]+/g,""));
}

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});

var retData = {};

casper.start(url);

casper.then(function() {
  var properties = [], stocks = [], propertiesAry = [];

  var retColor = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var colorID = "color-drop";
    var colorName = "color";

    var colorOptions = document.querySelectorAll("#"+colorID+" a");

    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];

    for (var i = 0; i < colorOptions.length; i++) {
      var tmpColorOption = colorOptions[i];

      var tmpColorImgEle = tmpColorOption.querySelector("img");
      var tmpDesc = tmpColorOption.querySelector("span").innerText;
      var tmpSample = tmpColorImgEle.src;
      var tmpDemo = tmpSample.replace("_056_","_450_");
      var exID = tmpColorOption.id;

      var tmpColorObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: exID
      };

      color['data'][exID] = tmpColorObject;
      colors.push(exID);
    }

    return {color:color, colors:colors};
  });

  var retSize = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var sizeID = "size-drop";
    var sizeName = "size";

    var sizeOptions = document.querySelectorAll("#"+sizeID+" a");

    var size = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    var sizes = [];

    for (var i = 0; i < sizeOptions.length; i++) {
      var tmpOption = sizeOptions[i];

      var tmpDescAry = tmpOption.innerText.trim().split("\n");
      tmpDescAry.forEach(function(v,i,a) {
        a[i] = v.trim();
      });
      var tmpDesc = tmpDescAry.join("-");
      var tmpSample = "", tmpDemo = "";
      var exID = tmpOption.id;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: exID
      };

      size['data'][exID] = tmpObject;
      sizes.push(exID);
    }

    return {size:size, sizes:sizes};
  });

  properties.push(retColor['color']);
  properties.push(retSize['size']);
  propertiesAry.push(retColor['colors']);
  propertiesAry.push(retSize['sizes']);

  var stockMapping = cartesianProduct(propertiesAry);
  for (var x in stockMapping) {
    var tmpRow = stockMapping[x];
    var tmpStock = {};
    for (var y in tmpRow) {
      var selectValue = String(tmpRow[y]);
      var selector = properties[y].id;
      tmpStock[selector] = selectValue;
    }
    tmpStock['soldout'] = 1;
    stocks.push(tmpStock);
  }

  var availablities = this.evaluate(function() {
    var options = document.querySelectorAll("#size-drop a");

    var availablities = {};
    for (var i = 0; i < options.length; i++) {
      var tmpOption = options[i];

      var tmpSizeID = tmpOption.id;
      var tmpAvailableColorIDs = tmpOption.dataset.enabledColors.split(",");
      for (var m = 0; m < tmpAvailableColorIDs.length; m++) {
        var tmpIndex = tmpAvailableColorIDs[m] + "_" + tmpSizeID;
        availablities[tmpIndex] = 1;
      }
    }

    return availablities;
  });

  var tmpStock, stockValue;
  for (var x in stocks) {
    tmpStock = stocks[x];
    var tmpTarget = [];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget.push(tmpStock[m]);
    }
    var tmpIndex = tmpTarget.join("_");
    stockValue = availablities[tmpIndex] ? false : true;
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
