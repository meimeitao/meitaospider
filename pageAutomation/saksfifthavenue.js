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

var retData;

//casper.on("remote.message", function(message) {
//  this.echo("remote console.log: " + message);
//});
//
//casper.on('page.error', function (msg, trace) {
//  this.echo( 'Error: ' + msg, 'ERROR' );
//});

casper.start(url);

casper.then(function() {
    var properties = [], stocks = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "color";
        var colorName = "color";

        var colorOptions = document.querySelectorAll(".item.color");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var tmpDesc = tmpOption.title;
            var tmpSample = "";
            var tmpDemo = "";
            var tmpID = tmpOption.title;

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

        var sizeOptions = document.querySelectorAll(".item.size");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            var tmpDesc = tmpOption.title;
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

    if (retColor["colors"].length > 0) {
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
                var ele = document.querySelector(".item."+id+"[title='"+value+"']");
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent('click', true, false);
                ele.dispatchEvent(evt);
            }, m, tmpTarget);
        }
        //this.capture('runtime/screenshot_'+x+'.png');
        stockValue = this.evaluate(function getStockStatus() {
            var stockStr = document.querySelector(".sfa-button").innerText.trim();
            return stockStr == "ADD TO BAG" ? true : false;
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