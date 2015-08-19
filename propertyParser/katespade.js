var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$("li.attribute").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children(".value").children("ul.swatches").find(".swatchanchor").each(function() {
        var tmpDesc = $(this).attr("title").trim();
        tmpVal = $(this).parent().attr("data-value");
        tmpVal = tmpVal ? tmpVal : tmpDesc;

        var demoStr = $(this).parent().attr("data-pimage");
        var sampleStr = $(this).children("img").attr("src");
        tmpProperties[tmpVal] = {
          desc: tmpDesc
          , demo: demoStr ? demoStr : ""
          , sample: sampleStr ? sampleStr : ""
        }
        tmpPropertiesArray.push(tmpVal);    
      });
      var label = $(this).children(".label").text().split("\n")[0].trim();
      var tmpIndex = $(this).parent().attr("data-name");
      tmpIndex = tmpIndex ? tmpIndex : label;
      tmpName = label;
      tmpIndex = tmpIndex;
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
