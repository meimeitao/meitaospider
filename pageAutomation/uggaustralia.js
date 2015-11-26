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

//var GetProductAvailabilityFlag = false;
//
//casper.options.onResourceRequested = function(resource, request) {
//    if (request.url.indexOf("Product-Variation") > -1) {
//        GetProductAvailabilityFlag = true;
//    }
//};

var retData = {};

casper.start(url);

casper.then(function() {
    var properties = [], stocks = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "Color";
        var colorName = "color";

        var colorOptions = document.querySelectorAll(".swatches.Color .swatchanchor");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var tmpDesc = tmpOption.title.trim();
            var tmpLgImgJSON = JSON.parse(tmpOption.dataset.lgimg);
            var tmpDemo = tmpLgImgJSON["url"];
            var tmpSample = "";
            var tmpID = tmpDesc;

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
        var sizeID = "Size";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll(".swatches.variationsize .swatchanchor");

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
    if (retSize["sizes"].length > 0) {
        properties.push(retSize['size']);
        propertiesAry.push(retSize['sizes']);
    }

    var stockMapping = cartesianProduct(propertiesAry);
    var stockObject = {}, stockObjectIndex = [];
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        stockObjectIndex = [];
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

    var stockUrls = [];
    var tmpStock, stockValue;
    for (var x in stocks) {
        tmpStock = stocks[x];

        var url = this.evaluate(function(id, value) {
            var ele = document.querySelector(".Color li.emptyswatch .swatchanchor[title='"+value+"']");
            if (ele) {
                return ele.href == location.href ? false : ele.href;
            } else {
                return false;
            }
        }, "Color", tmpStock["Color"]);

        if (url && stockUrls.indexOf(url) < 0) {
            stockUrls.push(url);
        }
    }

    var fStocks = [];

    var colorTitle = this.evaluate(function() {
        var ele = document.querySelector(".Color li.selected a.swatchanchor");
        return ele.title;
    });

    var sizeStocks = this.evaluate(function() {
        var ele = document.querySelectorAll(".variationsize .swatchanchor");
        var retObj = {};
        for (var i = 0; i < ele.length; i++) {
            var tmpEle = ele[i];
            retObj[tmpEle.title] = tmpEle.parentNode.className.indexOf("bisn-unselectable") > -1 ? 1 : 0;
        }
        return retObj;
    });

    for (var x in sizeStocks) {
        var tmpSize = sizeStocks[x];
        var concatIndex = colorTitle + "_" + x;
        stockObject[concatIndex]['soldout'] = tmpSize;
        fStocks.push(stockObject[concatIndex]);
    }

    this.start().each(stockUrls, function(self, link) {
        self.thenOpen(link, function() {
            colorTitle = this.evaluate(function() {
                var ele = document.querySelector(".Color li.selected a.swatchanchor");
                return ele.title;
            });

            sizeStocks = this.evaluate(function() {
                var ele = document.querySelectorAll(".variationsize .swatchanchor");
                var retObj = {};
                for (var i = 0; i < ele.length; i++) {
                    var tmpEle = ele[i];
                    retObj[tmpEle.title] = tmpEle.parentNode.className.indexOf("bisn-unselectable") > -1 ? 1 : 0;
                }
                return retObj;
            });

            for (var x in sizeStocks) {
                var tmpSize = sizeStocks[x];
                var concatIndex = colorTitle + "_" + x;
                stockObject[concatIndex]['soldout'] = tmpSize;
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
    this.exit();
});