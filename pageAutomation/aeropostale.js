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
    var primitivePriceCurrency = "USD";
    var colorID = "cId";
    var colorName = "COLOR";
    var sizeID = "sId";
    var sizeName = "SIZE";
    var propertiesAry = [];

    var itemMap = this.evaluate(function() {
        return itemMap;
    });

    var siteUrl = this.evaluate(function() {
        return location.origin;
    });

    var imageMap = this.evaluate(function() {
        var imageMap = {};
        for (var i = 0; i < imageMap_0.length; i++) {
            var tmpImage = imageMap[i];
            imageMap[tmpImage["cid"]] = {
                "swatch": tmpImage["enh"],
                "demo": tmpImage["reg"]
            }
        }
        return imageMap;
    });

    var color = {}, size = {};
    color['name'] = colorName;
    color['id'] = colorID;
    color['data'] = {};
    size['name'] = sizeName;
    size['id'] = sizeID;
    size['data'] = {};

    propertiesAry[0] = [];
    propertiesAry[1] = [];
    for (var x in itemMap) {
        var tmpItem = itemMap[x];
        var tmpImage = imageMap[tmpItem["cId"]];
        var tmpDemo = siteUrl + tmpImage["demo"];
        var tmpSample = siteUrl + tmpImage["swatch"];

        var tmpColor = tmpItem["cId"].trim();
        var tmpColorText = tmpItem["cDesc"].trim();
        var tmpColorObject = {
            desc: tmpColorText
            , demo: tmpDemo
            , sample: tmpSample
            , primitive_price: parseMoney(tmpItem["price"])
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpColor
        };

        color["data"][tmpColor] = tmpColorObject;
        if (propertiesAry[0].indexOf(tmpColor) == -1) {
            propertiesAry[0].push(tmpColor);
        }

        var tmpSize = tmpItem["sDesc"].trim();
        var tmpSizeText = tmpItem["sId"].trim();
        var tmpSizeObject = {
            desc: tmpSizeText
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
        for (var i = 0; i < itemMap.length; i++) {
            var tmpItem = itemMap[i];
            if (tmpStock[colorID] == tmpItem["cId"] && tmpStock[sizeID] == tmpItem["sId"]) {
                tmpStock["soldout"] = tmpItem["avail"] ? 0 : 1;
            }
        }
    }

    retData = {
        "properties": properties
        , "stocks": stocks
    };

});

casper.run(function() {
    utils.dump(retData);
    casper.exit();
});