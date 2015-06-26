module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var detailTag = $(".col-md-12 h4:contains('Shipment Details')").first();
    var detailContainer = detailTag.parent().find("tr");
    //var detailContainer = $(".col-md-12").first().find("tr");
    var detail = {};
    var key,value;
    detailContainer.each(function() {
      $(this).children('th').each(function() {
        key = $(this).text();
        if (key == 'Carrier:') {
          cv = $(this).next().children("input").attr("onclick");
          if (cv) {
            value = cv.split("','")[0];
            value = value.split("'")[1];
          } else {
            value = '';
          }
        } else {
          value = $(this).next().text();
        }
        detail[key] = value;
      });
    });
    var shipment = [];
    var shipmentHistoryTag = $(".col-md-12 h4:contains('Shipment History')").first();
    //var shipmentHistoryTag;
    //$("h4").each(function() {
    //  console.log($(this).text().trim());
    //  if ($(this).text().trim() == 'Shipment History') {
    //    console.log("hitted");
    //    shipmentHistoryTag = $(this);
    //  }
    //});
    var shipmentContainer = shipmentHistoryTag.parent().find("tr");
    //var shipmentContainer = $(".container.visible-md .col-md-12").eq(1).find("tr");
    shipmentContainer.each(function(i,el) {
      if (i > 0) {
        shipment.push({
          time: $(this).children('td').first().text().trim()
          , activity: $(this).children('td').eq(1).text().trim()
          , code: $(this).children('td').eq(2).text().trim()
        });
      }
    });
    obj.detail = detail
    obj.shipment = shipment
  	return JSON.stringify(obj);
  };
};
