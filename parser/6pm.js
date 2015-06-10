var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpDimension, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$("#prForm select").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      tmpDimension = $(this);
      $(this).children("option").each(function() {
        tmpVal = $(this).val();
        if (tmpVal.indexOf("-1_") == -1) {
          tmpProperties[tmpVal] = $(this).text();
          tmpPropertiesArray.push(tmpVal);
        }
      });
      tmpName = $(this).children("option").first().val();
      if (tmpName) {
        tmpName = tmpName.replace("-1_","");
      }
      tmpIndex = $(this).attr("id");
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
      tmpStock['soldout'] = 0;
      stocks.push(tmpStock);
    }
    
    var obj = {
      'properties': properties
      , 'stocks': stocks
    };
    return JSON.stringify(obj);
  };
};
