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

var retData = {};

casper.start(url);

casper.then(function() {
  var properties = [], stocks = [], propertiesAry = [];

  this.evaluate(function() {
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent('click', true, false);
    document.querySelector("#mb_close_link").dispatchEvent(evt);
  });

  var retSize = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var sizeID = "sizes";
    var sizeName = "Size";

    var sizeOptions = document.querySelectorAll("#"+sizeID+" option");

    var size = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    var sizes = [];

    for (var i = 0; i < sizeOptions.length; i++) {
      var tmpOption = sizeOptions[i];
      if (!tmpOption.id) continue;

      var tmpSizeObject = {
        desc: tmpOption.text
        , demo: ""
        , sample: ""
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpOption.id
      };

      size["data"][tmpOption.id] = tmpSizeObject;
      sizes.push(tmpOption.id);
    }

    return {size:size, sizes:sizes};
  });

  var retWidth = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var widthID = "widths";
    var widthName = "Width";

    var widthOptions = document.querySelectorAll("#"+widthID+" option");

    var width = {};
    width['name'] = widthName;
    width['id'] = widthID;
    width['data'] = {};

    var widths = [];
    
    for (var i = 0; i < widthOptions.length; i++) {
      var tmpOption = widthOptions[i];
      if (!tmpOption.id) continue;

      var tmpWidthObject = {
        desc: tmpOption.text
        , demo: ""
        , sample: ""
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpOption.id
      };

      width["data"][tmpOption.id] = tmpWidthObject;
      widths.push(tmpOption.id);
    }

    return {width:width, widths:widths};
  });

  var retColors = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var colorID = "colors";
    var colorName = "Color";
    var colorSwatches = document.querySelectorAll("#"+colorID+" img");
    
    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];
    
    for (var i = 0; i < colorSwatches.length; i++) {
      var tmpSwatch = colorSwatches[i];

      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('mouseover', true, false);
      tmpSwatch.dispatchEvent(evt);
      var tmpDemo = document.querySelector(".zoom_fixed").src;

      var tmpSwatchObject = {
        desc: tmpSwatch.title
        , demo: tmpDemo
        , sample: tmpSwatch.src
        , primitive_price: 0
        , primitive_price_currency: primitivePriceCurrency
        , exID: tmpSwatch.id
      };

      color["data"][tmpSwatch.id] = tmpSwatchObject;
      colors.push(tmpSwatch.id);
    }
    return {color:color, colors:colors};
  });

  propertiesAry.push(retColors['colors']);
  properties.push(retColors['color']);
  propertiesAry.push(retSize['sizes']);
  properties.push(retSize['size']);
  propertiesAry.push(retWidth['widths']);
  properties.push(retWidth['width']);

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
    tmpStock['soldout'] = 1;
    stocks.push(tmpStock);
  }

  var tmpStock, stockValue, tmpTarget;
  for (var x in stocks) {
    tmpStock = stocks[x];
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      this.evaluate(function(id, value) {
        if (id == "colors") {
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('click', true, false);
          var ele = document.querySelector("#"+value);
          if (ele.className.indexOf("swatchNormal") > -1) {
            ele.dispatchEvent(evt);
          }
        } else {
          var ele = document.querySelector("#"+value);
          var selector = document.querySelector("#"+id);
          var index = ele ? ele.index : 0;
          selector.selectedIndex = index;
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent('change', true, false);
          selector.dispatchEvent(evt);
        }
      }, m, tmpTarget);
    }
    stockValue = this.evaluate(function() {
      var addToBagLink = document.querySelector("#addToBagLink");
      return addToBagLink.className.indexOf("disabled") > -1 ? true : false;
    });
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
