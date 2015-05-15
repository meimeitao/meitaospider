module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$("#itemDisplayName").text();
  	obj.title = title;
    var price = this.$(".mainprice").text();
  	obj.price = price;
    var imgs = Array();
    this.$(".imgzoom-thumb-main").find("img").each(function(i, elem){
      realimg = $(this).attr("src-large");
      imgs.push(realimg);
    });
    obj.img = imgs;
    obj.currency = 'RMB';
    obj.en = 'suning';
  	return JSON.stringify(obj);
  };
}
