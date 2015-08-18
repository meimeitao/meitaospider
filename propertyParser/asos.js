var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$(".content_separate_details .select-style select").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children("option").each(function() {
        tmpVal = $(this).val();
        if (tmpVal != -1) {
          tmpProperties[tmpVal] = {
            desc: $(this).text().split("- Not available")[0].trim()
            , demo: ""
            , sample: ""
          }
          tmpPropertiesArray.push(tmpVal);
        }
      });
      tmpName = $(this).parent().parent().attr("class").split(" ")[0].trim();
      tmpIndex = $(this).attr("id");
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
