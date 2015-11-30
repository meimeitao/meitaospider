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
//    this.echo( 'Error: ' + msg, 'ERROR' );
//});

casper.start(url);

casper.then(function() {
    var properties = [], stocks = [], propertiesAry = [];

    var retColor = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var colorID = "color";
        var colorName = "color";

        var colorOptions = document.querySelectorAll(".swatches.color a.swatchanchor");
        var color = {};
        color['name'] = colorName;
        color['id'] = colorID;
        color['data'] = {};

        var colors = [];

        for (var i = 0; i < colorOptions.length; i++) {
            var tmpOption = colorOptions[i];

            if (tmpOption.href) continue;

            var tmpDesc = tmpOption.title;
            var tmpSample = tmpOption.style.background.replace(/url\((.*)\)/,"$1");
            try {
                var tmpLgImgJSON = JSON.parse(tmpOption.dataset.lgimg);
                var tmpDemo = tmpLgImgJSON["url"];
            } catch (Exception) {
                var tmpDemo = "";
            }
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
        var sizeID = "dd-size";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll(".dd-size select option");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            if (!tmpOption.dataset.dv) continue;

            var tmpDesc = tmpOption.dataset.dv;
            var tmpSample = "", tmpDemo = "";
            var tmpID = tmpOption.dataset.dv;

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
        var widthID = "dd-width";
        var widthName = "width";

        var widthOptions = document.querySelectorAll(".dd-width select option");

        var width = {};
        width['name'] = widthName;
        width['id'] = widthID;
        width['data'] = {};

        var widthes = [];

        for (var i = 0; i < widthOptions.length; i++) {
            var tmpOption = widthOptions[i];

            if (!tmpOption.selected) continue;

            var tmpDesc = tmpOption.dataset.dv;
            var tmpSample = "", tmpDemo = "";
            var tmpID = tmpOption.dataset.dv;

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
    if (retWidth["widthes"].length > 0) {
        properties.push(retWidth['width']);
        propertiesAry.push(retWidth['widthes']);
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

    var tmpStock, stockValue;
    for (var x in stocks) {
        tmpStock = stocks[x];
        stockValue = this.evaluate(function(id, value) {
            var select = document.querySelector("."+id+" select");
            var ele = select.querySelector("option[data-dv='"+value+"']");
            return ele.disabled;
        }, "dd-size", tmpStock["dd-size"]);
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
