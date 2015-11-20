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

casper.on("remote.message", function(message) {
  this.echo("remote console.log: " + message);
});

casper.on('page.error', function (msg, trace) {
  this.echo( 'Error: ' + msg, 'ERROR' );
});

var retData = {};

casper.start(url, function() {
  this.echo("Opening url: "+url);
});

casper.then(function() {
  var properties = [], stocks = [], propertiesAry = [];

  this.capture("runtime/main.png");

  var retColor = this.evaluate(function() {
    function parseMoney(amount) {
      return amount ? (amount.replace(/[^0-9\.]+/g,"")) : 0;
    }

    var primitivePriceCurrency = "USD";
    var colorID = "Color";
    var colorName = "color";

    console.log("."+colorID+" li");
    var colorOptions = document.querySelectorAll("."+colorID+" li");
    console.log(colorOptions.length);
    var color = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};

    var colors = [];

    for (var i = 0; i < colorOptions.length; i++) {
      var tmpOption = colorOptions[i];
      var tmpSwatchanchor = tmpOption.querySelector("a.swatchanchor");
      var tmpSwatchImg = tmpSwatchanchor.querySelector("img");

      var tmpDesc = tmpSwatchanchor.title;
      var tmpSample = tmpOption.dataset.pimage;
      var tmpDemo = tmpSwatchImg.src;
      var tmpPrice = document.querySelector("span.price-sales").innerText.trim();
      var tmpID = tmpOption.dataset.value;

      var tmpObject = {
        desc: tmpDesc
        , demo: tmpDemo
        , sample: tmpSample
        , primitive_price: parseMoney(tmpPrice)
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

    var sizeOptions = document.querySelectorAll("."+sizeID+" li a");

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

  properties.push(retColor['color']);
  propertiesAry.push(retColor['colors']);
  if (retSize['size'].length > 0) {
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
    tmpStock['soldout'] = 1;
    stocks.push(tmpStock);
  }

  var tmpStock, stockValue, tmpTarget;
  for (var x in stocks) {
    tmpStock = stocks[x];
    var sizeID;
    for (var m in tmpStock) {
      if (m == 'soldout') continue;
      tmpTarget = tmpStock[m];
      this.evaluate(function setProperties(id, value) {
        if (id != 'Color') return false;
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('click', true, false);
        var ele = document.querySelector("."+id+" li[data-value='"+value+"']");
        ele.dispatchEvent(evt);
      }, m, tmpTarget);
      if (m == 'size') sizeID = tmpTarget;
    }
    //this.capture('runtime/screenshot_'+x+'.png');
    stockValue = this.evaluate(function getStockStatus(sizeID) {
      var sizeSwatch = document.querySelector(".swatchanchor[title='"+sizeID+"']");
      return sizeSwatch.parentNode.className.indexOf("unselectable") > -1 ? false : true;
    }, sizeID);
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