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

casper.waitFor(function check() {
    return this.evaluate(function() {
        var sizes = document.querySelectorAll("#detailSizeDropdown li[class^='js-product-selecSize-dropdown']:not(.hide)");
        return sizes.length > 0 ? true :false;
    });
});

casper.then(function() {
    var properties = [], stocks = [], propertiesAry = [];

    var retSize = this.evaluate(function() {
        var primitivePriceCurrency = "USD";
        var sizeID = "size";
        var sizeName = "size";

        var sizeOptions = document.querySelectorAll("#detailSizeDropdown li[class^='js-product-selecSize-dropdown']:not(.hide)");

        var size = {};
        size['name'] = sizeName;
        size['id'] = sizeID;
        size['data'] = {};

        var sizes = [];

        for (var i = 0; i < sizeOptions.length; i++) {
            var tmpOption = sizeOptions[i];

            var tmpDesc = tmpOption.querySelector(".productDetailModule-dropdown-numberItems").innerText.trim();
            var tmpSample = "", tmpDemo = "";
            var tmpID = i;

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


    properties.push(retSize['size']);
    propertiesAry.push(retSize['sizes']);

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

    retData = {
        "properties": properties
        , "stocks": stocks
    };

});

casper.run(function() {
    utils.dump(retData);
    this.exit();
});