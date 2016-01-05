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

var retData = {};

casper.start(url);

casper.then(function() {
    var properties = [], stocks = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "color";
        var colorName = "color";

        var colorOptions = document.querySelectorAll(".colorlist li.selected a.colorVariant");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var tmpDesc = tmpOption.dataset.color;
            var tmpSample = tmpOption.querySelector("img.swatch").src;
            var tmpDemo = tmpOption.querySelector("img.preview").src;
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
        var sizeID = "size";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll("#Size option:not(:disabled)");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};
        var sizes = [];
        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            var tmpDesc = tmpOption.dataset.promptValue;
            var tmpSample = "", tmpDemo = "";
            var tmpID = tmpOption.value;

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

    var retWidth = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var dataID = "width";
        var dataName = "width";

        var options = document.querySelectorAll("#Fit option:not(:disabled)");

        var width = {};
        width['name'] = dataName;
        width['id'] = dataID;
        width['data'] = {};
        var widthes = [];
        for (var i = 0; i < options.length; i++) {
            var tmpOption = options[i];

            var tmpDesc = tmpOption.dataset.promptValue;
            var tmpSample = "", tmpDemo = "";
            var tmpID = tmpOption.value;

            var tmpObject = {
                desc: tmpDesc
                , demo: tmpDemo
                , sample: tmpSample
                , primitive_price: 0
                , primitive_price_currency: primitivePriceCurrency
                , exID: tmpID
            };

            width['data'][tmpID] = tmpObject;
            widthes.push(tmpID);
        }

        return {width:width, widthes:widthes};
    });

    properties.push(retColor['color']);
    propertiesAry.push(retColor['colors']);
    properties.push(retSize['size']);
    propertiesAry.push(retSize['sizes']);
    properties.push(retWidth['width']);
    propertiesAry.push(retWidth['widthes']);

    var stockMapping = cartesianProduct(propertiesAry);
    for (var x in stockMapping) {
        var tmpRow = stockMapping[x];
        var tmpStock = {};
        for (var y in tmpRow) {
            var selectValue = String(tmpRow[y]);
            var selector = properties[y].id;
            tmpStock[selector] = selectValue;
        }
        tmpStock['soldout'] = 0;
        stocks.push(tmpStock);
    }

    var rawSkuData = this.evaluate(function() {
        return JSON.parse(document.querySelector("#Size").dataset.matrix);
    });

    for (var i = 0; i < stocks.length; i++) {
        tmpStock = stocks[i];
        var tmpSku = rawSkuData[tmpStock["size"]][tmpStock["width"]];
        var isSoldout = true;
        if (tmpSku) {
            isSoldout = tmpSku.outOfStock;
        }
        if (isSoldout) {
            stocks[i].soldout = 1;
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