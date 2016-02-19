var casper = require('casper').create({
    pageSettings: {
        loadImages:  false,
        loadPlugins: false
    },
    timeout: 300000 //MS 5mins
});
var utils = require("utils");
var system = require('system');
var cartesianProduct = require('cartesian-product');

var args = casper.cli.args;

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
    var properties = [], stocks = [], propertiesAry = [], propertiesMapping = {};

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "color";
        var colorName = "color";

        var colorOptions = document.querySelectorAll(".select-color .new-selector--color");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var tmpDesc = tmpOption.dataset.colorName;
            var tmpSample = tmpOption.querySelector("img.new-selector__swatch").src;
            var tmpID = tmpOption.dataset.colorName;

            var tmpObject = {
                desc: tmpDesc
                , demo: ""
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

        var sizeOptions = document.querySelectorAll(".select-size .new-selector--size");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            var tmpDesc = tmpOption.dataset.sizeName;
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

    if (retColor["colors"].length > 0) {
        properties.push(retColor['color']);
        propertiesAry.push(retColor['colors']);
    }
    if (retSize["sizes"].length > 0) {
        properties.push(retSize['size']);
        propertiesAry.push(retSize['sizes']);
    }

    var stockMapping = cartesianProduct(propertiesAry);
    var stockObject = {} ;
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        var stockObjectIndex = [];
        for (var y in tmpRow) {
            var selectValue = String(tmpRow[y]);
            var selector = properties[y].id;
            tmpStock[selector] = selectValue;
            stockObjectIndex.push(selectValue);
        }
        tmpStock['soldout'] = 1;
        stocks.push(tmpStock);
        stockObject[stockObjectIndex.join("_")] = tmpStock;
    }

    var stockUrls = this.evaluate(function() {
        var colorOptions = document.querySelectorAll(".select-color .new-selector--color a");
        var stockUrls = [];
        for (var i = 0; i < colorOptions.length; i++) {
            stockUrls.push(colorOptions[i].href);
        }
        return stockUrls;
    });

    var fStocks = [];

    this.start().each(stockUrls, function(self, link) {
        self.thenOpen(link, function() {
            var selectedColorName = this.evaluate(function() {
                var selectedColorEle = document.querySelector(".select-color .new-selector--color.new-selector--active");
                return selectedColorEle.dataset.colorName;
            });

            var sizeStocks = this.evaluate(function() {
                var sizeEles = document.querySelectorAll(".select-size .new-selector--size");

                var retObj = {};
                for (var i = 0; i < sizeEles.length; i++) {
                    var tmpSizeEle = sizeEles[i];
                    if (tmpSizeEle.className.indexOf("new-selector--sold-out") > -1) {
                        retObj[tmpSizeEle.dataset.sizeName] = 1;
                    } else {
                        retObj[tmpSizeEle.dataset.sizeName] = 0;
                    }
                }

                return retObj;
            }, selectedColorName);

            for (var x in sizeStocks) {
                var tmpSizeStock = sizeStocks[x];
                var concatIndex = selectedColorName + "_" + x;
                stockObject[concatIndex]['soldout'] = tmpSizeStock;
                fStocks.push(stockObject[concatIndex]);
            }
        });
    });

    retData = {
        "properties": properties
        , "stocks": fStocks
    };
});

casper.run(function() {
    utils.dump(retData);
    casper.exit();
});