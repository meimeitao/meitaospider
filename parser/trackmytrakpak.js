module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var detailContainer = this.$(".col-md-12").eq(0).find($("tr"));
    var detail = {};
    var key,value;
    detailContainer.each(function() {
      $(this).children('th').each(function() {
        key = $(this).text();
        if (key == 'Carrier:') {
          value = $(this).next().children("input").attr("onclick").split("','")[0];
          value = value.split("'")[1];
        } else {
          value = $(this).next().text();
        }
        detail[key] = value;
      });
    });
    var shipment = [];
    var shipmentContainer = this.$(".col-md-12").eq(1).find($("tr"));
    shipmentContainer.each(function(i,el) {
      if (i > 0) {
        shipment.push({
          time: $(this).children('td').eq(0).text()
          , activity: $(this).children('td').eq(1).text()
          , code: $(this).children('td').eq(2).text()
        });
      }
    });
    obj.detail = detail
    obj.shipment = shipment
  	return JSON.stringify(obj);
  };
};
