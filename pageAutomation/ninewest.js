var casper = require('casper').create({
  pageSettings: {
    loadImages:  false,
    //loadPlugins: false
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
  var properties = [], propertiesAry = [];

  var retColor = this.evaluate(function() {
    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }

    var primitivePriceCurrency = "USD";
    var colorID = "colorChips";
    var colorName = "color";

    var colorOptions = document.querySelectorAll("."+colorID+" img.selected_true");
    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];

    for (var i = 0; i < colorOptions.length; i++) {
      var tmpColorOption = colorOptions[i];

      var tmpDesc = tmpColorOption.title;
      var tmpSample = tmpColorOption.src;

      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('click', true, false);
      tmpColorOption.dispatchEvent(evt);

      var tmpDemo = document.querySelector("#zoomImgHolder2 img").src;
      var tmpPirce = document.querySelector("#PDPSellingPrice").innerText;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: parseMoney(tmpPirce)
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpColorOption.id
      };

      color['data'][tmpColorOption.id] = tmpObject;
      colors.push(tmpColorOption.id);
    }

    return {color:color, colors:colors};
  });

  var retSize = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var sizeID = "sizes";
    var sizeName = "size";

    var sizeOptions = document.querySelectorAll("#"+sizeID+" .sizeChip");

    var size = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    var sizes = [];

    for (var i = 0; i < sizeOptions.length; i++) {
      var tmpOption = sizeOptions[i];

      var tmpDesc = tmpOption.innerText;
      var tmpSample = "", tmpDemo = "";
      var tmpID = tmpOption.id;

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

  properties.push(retColor['color']);
  properties.push(retSize['size']);
  propertiesAry.push(retColor['colors']);
  propertiesAry.push(retSize['sizes']);

  var stocks = [];
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
