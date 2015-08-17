var cartesianProduct = require('cartesian-product');

module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var properties = [], tmpProperties = {}, tmpIndex, tmpVal, tmpName, propertyHash = {}, propertiesArray = [], tmpPropertiesArray = [];
    this.$("section#color1").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children(".color-box").children("a").each(function() {
        tmpVal = $(this).attr("id").trim();
        tmpProperties[tmpVal] = {
          desc: ""
          , demo: $(this).children("img").attr("data-imgurl")
          , sample: $(this).children("img").attr("src")
        }
        tmpPropertiesArray.push(tmpVal);
      });
      tmpName = "COLOR";
      tmpIndex = "color1"
      propertyHash = {name:tmpName,data:tmpProperties,id:tmpIndex};
      properties.push(propertyHash);
      propertiesArray.push(tmpPropertiesArray);
    });

    this.$("section#sizes0").each(function() {
      tmpProperties = {};
      tmpPropertiesArray = [];
      $(this).children(".size-box").children("a").each(function() {
        tmpVal = $(this).attr("id").trim();
        tmpProperties[tmpVal] = {
          desc: $(this).text().trim()
          , demo: ""
          , sample: ""
        }
        tmpPropertiesArray.push(tmpVal);
      });
      tmpName = "SIZE";
      tmpIndex = "sizes0"
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
