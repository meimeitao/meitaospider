var casper = require('casper').create({
    pageSettings: {
        loadImages:  false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; nl; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6'
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
        var colorID = "colors";
        var colorName = "color";

        var colorOptions = document.querySelectorAll(".colors label");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('click', true, false);
            tmpOption.dispatchEvent(evt);

            var mainImage = document.querySelector(".main-image img");

            var tmpDesc = tmpOption.title;
            var tmpSample = "";
            var tmpDemo = mainImage ? mainImage.src : "";
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
        var sizeID = "sizes";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll("."+sizeID+" input[name=size]");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            if (tmpOption.value == "") continue;

            var tmpDesc = tmpOption.dataset.name;
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
        for (var m in tmpStock) {
            if (m == 'soldout') continue;
            tmpTarget = tmpStock[m];
            this.evaluate(function setProperties(id, value) {
                if (id == "colors") {
                    var ele = document.querySelector("."+id+" label[title='"+value+"']");
                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent('click', true, false);
                    ele.dispatchEvent(evt);
                }
            }, m, tmpTarget);
            if (m == "sizes") {
                tmpSize = tmpTarget;
            }
        }
        //this.capture('runtime/screenshot_'+x+'.png');
        stockValue = this.evaluate(function(size) {
            var ele = document.querySelector("input[value='"+size+"']");
            return ele.disabled;
        }, tmpSize);
        if (stockValue) {
            stocks[x].soldout = 1;
        } else {
            stocks[x].soldout = 0;
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