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
//  this.echo( 'Error: ' + msg, 'ERROR' );
//});

var retData = {};

casper.start(url);

casper.then(function() {
  var properties = [], stocks = [], propertiesAry = [];

  var retColor = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var colorID = "Color";
    var colorName = "color";

    var colorOptions = document.querySelectorAll(".swatches."+colorID+" li.selected");
    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];

    for (var i = 0; i < colorOptions.length; i++) {
      var tmpOption = colorOptions[i];

      var sampleEle = tmpOption.querySelector("img");

      var tmpDesc = tmpOption.querySelector(".title").innerText.trim();
      var tmpSample = sampleEle ? sampleEle.src : "";
      var tmpDemo = tmpOption.dataset.pimage;
      var tmpID = tmpOption.dataset.value;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpID
      };

      color['data'][tmpID] = tmpObject;
      colors.push(tmpID);
    }

    return {color:color, colors:colors};
  });

  var retSize = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var sizeID = "size";
    var sizeName = "size";

    var sizeOptions = document.querySelectorAll(".swatches."+sizeID+" li:not(.unselectable) a");

    var size = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    var sizes = [];

    for (var i = 0; i < sizeOptions.length; i++) {
      var tmpOption = sizeOptions[i];

      var tmpDesc = tmpOption.innerText;
      var tmpSample = "", tmpDemo = "";
      var tmpID = tmpOption.title;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpID
      };

      size['data'][tmpID] = tmpObject;
      sizes.push(tmpID);
    }

    return {size:size, sizes:sizes};
  });

  if (retColor['colors'].length > 0) {
    properties.push(retColor['color']);
    propertiesAry.push(retColor['colors']);
  }
  if (retSize["sizes"].length > 0) {
    properties.push(retSize['size']);
    propertiesAry.push(retSize['sizes']);
  }

  var stockMapping = cartesianProduct(propertiesAry);
  for (var x in stockMapping) {
    var tmpRow = stockMapping[x];
    var tmpStock = {};
    for (var y in tmpRow) {
      var selectValue = String(tmpRow[y]);
      var selector = properties[y].id;
      tmpStock[selector] = selectValue;
    }
    tmpStock['soldout'] = 0;
    stocks.push(tmpStock);
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