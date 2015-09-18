var casper = require('casper').create({
  pageSettings: {
      loadImages:  false,
      loadPlugins: false,
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

casper.start(url);

casper.then(function() {
  var properties = [], propertiesMapping = {}, propertiesAry = [];

  var retColor = this.evaluate(function() {
    function parseMoney(amount) {
      return Number(amount.replace(/[^0-9\.]+/g,""));
    }

    var primitivePriceCurrency = "USD";
    var colorID = "color-button-set";
    var colorName = "color";

    var colorOptions = document.querySelectorAll("."+colorID+" li");

    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];

    for (var i = 0; i < colorOptions.length; i++) {
      var tmpOption = colorOptions[i];

      var tmpSwatch = tmpOption.querySelector("a.swatch");
      var tmpDesc = tmpOption.title.trim();
      var tmpSample = "";

      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('mouseover', true, false);
      tmpSwatch.dispatchEvent(evt);

      var tmpDemo = document.querySelector(".product-image__primary-image").src;
      var exID = tmpOption.dataset.id;
      var tmpPrice = document.querySelector("span[itemprop='price']").innerText;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: parseMoney(tmpPrice)
        , primitive_price_currency: primitivePriceCurrency
        , exID: exID
      };

      color['data'][exID] = tmpObject;
      colors.push(exID);
    }

    return {color:color, colors:colors};
  });

  var retSize = this.evaluate(function() {
    var primitivePriceCurrency = "USD";
    var sizeID = "size-button-set";
    var sizeName = "size";

    var sizeOptions = document.querySelectorAll("#"+sizeID+" li");

    var size = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    var sizes = [];

    for (var i = 0; i < sizeOptions.length; i++) {
      var tmpOption = sizeOptions[i];

      var tmpDesc = tmpOption.innerText;
      var tmpSample = "", tmpDemo = "";
      var tmpID = tmpOption.dataset.sizeName;

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
  propertiesAry.push(retColor['colors']);
  if (retSize['sizes'].length > 0) {
    properties.push(retSize['size']);
    propertiesAry.push(retSize['sizes']);
  }

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
      this.evaluate(function setProperties(id, value) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele;
        if (id == 'size-button-set') {
          ele = document.querySelector("[data-size-name='"+value+"']");
        } else {
          ele = document.querySelector("[data-id='"+value+"']");
        }
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    stockValue = this.evaluate(function getStockStatus() {
      var stockStr = document.querySelector(".order-button").innerText.toLowerCase();
      return stockStr == 'sold out' ? false : true;
    });
    if (stockValue) {
      stocks[x].soldout = 0;
    } else {
      stocks[x].soldout = 1;
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