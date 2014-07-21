module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
    var price = this.$("#productprice .price").text();
  	obj.price = price;
    var imgs = Array();
    this.$("#divPImage a").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = 'USD';
    obj.en = 'drugstroe';
  	return JSON.stringify(obj);
  };
}
