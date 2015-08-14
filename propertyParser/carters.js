var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$(".attribute").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children(".value").children(".swatches").children("li").children("a.swatchanchor").each(function() {
        tmpVal = $(this).attr("title").trim();
        tmpProperties[tmpVal] = {
          desc: $(this).text().trim()
          , demo: ""
          , sample: ""
        }
        tmpPropertiesArray.push(tmpVal);
      });
      tmpName = $(this).children(".value").children("span.label").text().trim();
      tmpIndex = $(this).children(".value").children("ul.swatches").attr("class").split(" ")[1];
      propertyHash = {name:tmpName,data:tmpProperties,id:tmpIndex};
      properties.push(propertyHash);
      propertiesArray.push(tmpPropertiesArray);
    });

    var mappingArray = [], tmpMappingHash = {}, tmpRow;
    var outOfStock = "Out of Stock";
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
