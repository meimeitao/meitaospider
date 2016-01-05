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
    var primitivePriceCurrency = "USD";
    var properties = [];
    var propertyIDs = [];
    var propertiesAry = [];

    var rawData = this.evaluate(function() {
        return JSON.parse(document.querySelector("#skuVarData").value);
    });

    if (rawData.colors) {
        var rawDataColor = rawData.colors;
        var color = {};
        color["name"] = "color";
        color["id"] = "color";
        color["data"] = {};
        var colors = [];
        for (var x in rawDataColor) {
            var tmpColor = rawDataColor[x];

            var tmpSample = tmpColor.hoverImage;
            var tmpDemo = tmpColor.zoomImage;
            var tmpName = tmpColor.name;
            var tmpID = x;

            var tmpObject = {
                desc: tmpName
                , demo: tmpDemo
                , sample: tmpSample
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpID
            };

            color["data"][tmpID] = tmpObject;
            colors.push(tmpID);
        }
        properties.push(color);
        propertyIDs.push(color["id"]);
        propertiesAry.push(colors);
    }

    if (rawData.sizes) {
        var rawDataSize = rawData.sizes;
        var size = {};
        size["name"] = "size";
        size["id"] = "size";
        size["data"] = {};
        var sizes = [];
        for (var i = 0; i < rawDataSize.length; i++) {
            var tmpData = rawDataSize[i];
            var tmpID = tmpData.key;
            var tmpName = tmpData.value;

            var tmpObject = {
                desc: tmpName
                , demo: ""
                , sample: ""
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpID
            };

            size["data"][tmpID] = tmpObject;
            sizes.push(tmpID);
        }

        properties.push(size);
        propertyIDs.push(size["id"]);
        propertiesAry.push(sizes);
    }



    var stockObj = {};
    var stockMapping = cartesianProduct(propertiesAry);
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        var tmpIndex = [];
        for (var y in tmpRow) {
            var selectValue = tmpRow[y];
            var selector = properties[y].id;
            tmpStock[selector] = selectValue;
            tmpIndex.push(selectValue);
        }
        tmpStock['soldout'] = 1;
        var tmpIndexStr = tmpIndex.join("_");
        stockObj[tmpIndexStr] = tmpStock;
    }

    var rawSkuData = rawData.skus;
    for (var x in rawSkuData) {
        var tmpSku = rawSkuData[x];
        var tmpIndex = [];
        for (var i = 0; i < propertyIDs.length; i++) {
            var tmpProperty = propertyIDs[i];
            tmpIndex.push(tmpSku[tmpProperty]);
        }
        var tmpIndexStr = tmpIndex.join("_");
        if (tmpSku.inventory == "1") {
            stockObj[tmpIndexStr]['soldout'] = 1;
        } else {
            stockObj[tmpIndexStr]['soldout'] = 0;
        }
    }

    var stocks = [];
    for (var x in stockObj) {
        stocks.push(stockObj[x]);
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