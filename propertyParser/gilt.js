var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$(".sku-attribute-values").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children("li.sku-attribute-value").each(function() {
        tmpVal = $(this).attr("data-attribute-value-id");

        //商品样本
        var sampleEle = $(this).children(".swatch-img");
        var sampleImage;
        if (sampleEle) {
          sampleImage = sampleEle.attr("src");
          if (sampleImage && sampleImage.indexOf("http") == -1) {
            sampleImage = "http:" + sampleImage;
          }
        }

        tmpProperties[tmpVal] = {
          desc: $(this).attr("data-value-name")
          , demo: ""
          , sample: sampleImage ? sampleImage : ""
        }
        tmpPropertiesArray.push(tmpVal);
      });
      tmpName = $(this).parent().attr("data-attribute-name").trim();
      tmpIndex = tmpName;
      propertyHash = {name:tmpName,data:tmpProperties,id:tmpIndex};
      properties.push(propertyHash);
      propertiesArray.push(tmpPropertiesArray);
    });


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
