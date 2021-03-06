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

var retData = {};

casper.start(url);

casper.then(function() {
    var properties = [], stocks = [];
    var cdnUrl = "http://s7d9.scene7.com/is/image/BetseyJohnson/";
    var primitivePriceCurrency = "USD";
    var colorID = "COLOR_ID";
    var colorName = "COLOR";
    var sizeID = "SIZE_ID";
    var sizeName = "SIZE";
    var propertiesAry = [];
    var colorName = "COLOR_NAME";
    var sizeName = "SIZE_NAME";

    var variantMatrices = this.evaluate(function() {
        return variantMatrices;
    });

    var variants = [];
    for (var x in variantMatrices) {
        var metrices = variantMatrices[x];
        variants = metrices['variants'];
    }

    var color = {}, size = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    propertiesAry[0] = [];
    propertiesAry[1] = [];
    for (var x in variants) {
        var tmpItem = variants[x];
        var tmpDemo = cdnUrl + tmpItem["RECOLORED_IMAGE"];
        var tmpSample = cdnUrl + tmpItem["SWATCH_IMAGE"];

        var tmpColor = tmpItem[colorName].trim();
        var tmpColorText = tmpItem["colorOptionText"].trim();
        var tmpColorObject = {
            desc: tmpColorText
            , demo: tmpDemo
            , sample: tmpSample
            , primitive_price: parseMoney(tmpItem["priceFormatted"])
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpColor
        };

        color["data"][tmpColor] = tmpColorObject;
        if (propertiesAry[0].indexOf(tmpColor) == -1) {
            propertiesAry[0].push(tmpColor);
        }

        var tmpSize = tmpItem[sizeName].trim();
        var tmpSizeObject = {
            desc: tmpSize
            , demo: ""
            , sample: ""
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpSize
        };

        size["data"][tmpSize] = tmpSizeObject;
        if (propertiesAry[1].indexOf(tmpSize) == -1) {
            propertiesAry[1].push(tmpSize);
        }
    }

    properties.push(color);
    properties.push(size);

    var stocks = [];
    var stockMapping = cartesianProduct(propertiesAry);
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        for (var y in tmpRow) {
            var selectValue = tmpRow[y];
            var selector = properties[y].id;
            tmpStock[selector] = selectValue;
        }
        tmpStock['soldout'] = 1;
        stocks.push(tmpStock);
    }

    for (var x in stocks) {
        var tmpStock = stocks[x];
        for (var y in variants) {
            var tmpItem = variants[y];
            if (tmpStock[colorID] == tmpItem[colorName] && tmpStock[sizeID] == tmpItem[sizeName]) {
                tmpStock["soldout"] = tmpItem["stock"] ? 0 : 1;
            }
        }
    }

    //for (var x in variants) {
    //  var tmpItem = variants[x];
    //  var tmpStockObj = {};
    //  tmpStockObj[colorID] = tmpItem["COLOR_NAME"];
    //  tmpStockObj[sizeID] = tmpItem["SIZE_NAME"];
    //  tmpStockObj["soldout"] = tmpItem["stock"] ? 0 : 1;
    //  stocks.push(tmpStockObj);
    //}

    retData = {
        "properties": properties
        , "stocks": stocks
    };

});

casper.run(function() {
    utils.dump(retData);
    casper.exit();
});