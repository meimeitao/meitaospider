var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    var spConfig = this.$(".product-options").children("script").first().text().trim();
    spConfigMatch = spConfig.match(/var spConfig = new Product.Config\((.*)\)/);
    if (spConfigMatch && spConfigMatch[1]) {
      var configJson = JSON.parse(spConfigMatch[1]);
      var attrs = configJson["attributes"];
      for (var x in attrs) {
        tmpProperties = {};
        tmpPropertiesArray = [];
        var tmpAttr = attrs[x];
        for (var m in tmpAttr['options']) {
          var tmpAttrOption = tmpAttr['options'][m];
          tmpVal = tmpAttrOption["id"];
          var tmpPrdId = tmpAttrOption['products'][0];
          tmpProperties[tmpVal] = {
            desc: tmpAttrOption["label"]
            , demo: configJson["swatchImages"][tmpPrdId] ? configJson["swatchImages"][tmpPrdId]["toggleImage"] : ""
            , sample: tmpAttrOption["swatch"]["img"] ? tmpAttrOption["swatch"]["img"] : ""
          }
          tmpPropertiesArray.push(tmpVal);
        }
        tmpName = tmpAttr["label"];
        tmpIndex = tmpAttr["id"];
        propertyHash = {name:tmpName,data:tmpProperties,id:tmpIndex};
        properties.push(propertyHash);
        propertiesArray.push(tmpPropertiesArray);
      }
    }

    var mappingArray = [], tmpMappingHash = {}, tmpRow;
    var stocks = [], tmpStock = {};
    mappingArray = cartesianProduct(propertiesArray);
    for (var x in mappingArray) {
      var tmpRow = mappingArray[x];
      tmpStock = {};
      for (var y in tmpRow) {
        var selectValue = tmpRow[y];
        var selector = properties[y].id;
        tmpStock[selector] = selectValue;
      }
      tmpStock['soldout'] = 1;
      stocks.push(tmpStock);
    }
    
    var obj = {
      'properties': properties
      , 'stocks': stocks
    };
    return JSON.stringify(obj);
  };
};
