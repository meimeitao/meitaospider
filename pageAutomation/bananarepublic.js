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
        var colorID = "colorSwatchContent";
        var colorName = "color";

        var colorOptions = document.querySelectorAll("#"+colorID+" input");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('mouseover', true, false);
            tmpOption.dispatchEvent(evt);

            var mainImage = document.querySelector("#product_image");

            var tmpDesc = tmpOption.alt.replace("product image","");
            var tmpSample = tmpOption.src;
            var tmpDemo = mainImage ? mainImage.src : "";
            if (tmpDemo && tmpDemo.indexOf("http") < 0) {
                tmpDemo = location.origin + tmpDemo;
            }
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
        var sizeID = "sizeDimensionSwatchContent";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll("#"+sizeID+" button");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            var tmpDesc = tmpOption.innerText;
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

    properties.push(retColor['color']);
    propertiesAry.push(retColor['colors']);
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

    var tmpStock, stockValue, tmpTarget, tmpSize;
    for (var x in stocks) {
        tmpStock = stocks[x];
        this.evaluate(function(id,value) {
            var colorOption = document.querySelector("#"+id+" #"+value);
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('mouseover', true, false);
            colorOption.dispatchEvent(evt);
        }, "colorSwatchContent", tmpStock["colorSwatchContent"]);
        //this.capture('runtime/screenshot_'+x+'.png');
        stockValue = this.evaluate(function(id,value) {
            var sizeButton = document.querySelector("#"+id+" #"+value);
            return sizeButton.className == "soldOut" ? true : false;
        }, "sizeDimensionSwatchContent", tmpStock["sizeDimensionSwatchContent"]);
        if (stockValue) {
            stocks[x].soldout = 1;
        } else {
            stocks[x].soldout = 0;
        }
        this.evaluate(function(id,value) {
            var colorOption = document.querySelector("#"+id+" #"+value);
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('mouseout', true, false);
            colorOption.dispatchEvent(evt);
        }, "colorSwatchContent", tmpStock["colorSwatchContent"]);
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