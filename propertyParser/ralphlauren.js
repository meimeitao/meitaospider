var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$("#color-swatches").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children("li").children("img").not('.crossoff').each(function() {
        tmpVal = $(this).attr("title").trim();
        tmpProperties[tmpVal] = {
          desc: tmpVal
          , demo: ""
          , sample: $(this).attr("src")
        }
        tmpPropertiesArray.push(tmpVal);
      });
      tmpName = "COLOR";
      tmpIndex = "color-swatches"
      propertyHash = {name:tmpName,data:tmpProperties,id:tmpIndex};
      properties.push(propertyHash);
      propertiesArray.push(tmpPropertiesArray);
    });

    this.$("#size-swatches").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children("li").each(function() {
        tmpVal = $(this).attr("title").trim();
        tmpProperties[tmpVal] = {
          desc: $(this).text().trim()
          , demo: ""
          , sample: ""
        }
        tmpPropertiesArray.push(tmpVal);
      });
      tmpName = "SIZE";
      tmpIndex = "size-swatches"
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
