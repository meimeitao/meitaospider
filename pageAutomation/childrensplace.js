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
    var properties = [], stocks = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "color-swatches";
        var colorName = "color";

        var colorOptions = document.querySelectorAll("."+colorID+" ul li");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var sampleEle = tmpOption.querySelector("img");

            var tmpDesc = sampleEle.title.trim();
            var tmpDemo = "";
            var tmpSample = sampleEle ? location.origin + sampleEle.src : "";
            var tmpID = tmpOption.id;

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
        var sizeID = "sizes";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll("."+sizeID+" ul li a");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            var tmpDesc = tmpOption.innerText.trim();
            var tmpSample = "", tmpDemo = "";
            var tmpID = tmpOption.id;

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

    var skuMapping = {};
    for (var i = 0; i < retColor["colors"].length; i++) {
        var tmpColor = retColor["colors"][i];
        var tmpItem = this.evaluate(function(val) {
            var itemID = val.replace("swatch_product_","");
            return eval("entitledItem_"+itemID);
        }, tmpColor);
        for (var m = 0; m < tmpItem.length; m++) {
            var tmpSku = tmpItem[m];
            var tmpIndexAry = [];
            tmpIndexAry.push(tmpColor);
            for (var x in tmpSku["Attributes"]) {
                tmpIndexAry.push(x);
            }
            var tmpIndex = tmpIndexAry.join("_");
            skuMapping[tmpIndex] = tmpSku["qty"] > 10 ? true : false;
        }
    }

    var tmpStock, stockValue, tmpTarget;
    for (var x in stocks) {
        tmpStock = stocks[x];
        var tmpIndexAry = [];
        for (var m in tmpStock) {
            if (m == 'soldout') continue;
            tmpIndexAry.push(tmpStock[m]);
        }
        var tmpIndex = tmpIndexAry.join("_");
        stockValue = skuMapping[tmpIndex];

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