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
    var propertiesAry = [];
    var primitivePriceCurrency = "USD";
    var colorID = 0;
    var sizeID = 1;

    var stockData = this.evaluate(function() {
        return JSON.parse(option_stock_data)
    });

    var color = {}, size = {};
    color['name'] = "Color";
    color['id'] = colorID;
    color['data'] = {};
    size['name'] = "Size";
    size['id'] = sizeID;
    size['data'] = {};

    propertiesAry[0] = [];
    propertiesAry[1] = [];
    for (var x in stockData) {
        var tmpItem = stockData[x];

        var tmpColor = tmpItem["option_value_orginal"][color["id"]];
        var tmpColorObject = {
            desc: tmpColor
            , demo: ""
            , sample: ""
            , primitive_price: 0
            , primitive_price_currency: primitivePriceCurrency
            , exID: tmpColor
        };

        color["data"][tmpColor] = tmpColorObject;
        if (propertiesAry[0].indexOf(tmpColor) == -1) {
            propertiesAry[0].push(tmpColor);
        }

        var tmpSize = tmpItem["option_value_orginal"][size["id"]];
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
        var tmpOptionValue = tmpStock[colorID] + "-" + tmpStock[sizeID];
        for (var y in stockData) {
            var tmpItem = stockData[y];
            if (tmpOptionValue == tmpItem["option_value"]) {
                tmpStock["soldout"] = tmpItem["use_soldout"] == "F" ? 0 : 1;
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