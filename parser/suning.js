module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$(".product-main-title h1").text();
  	obj.title = title;
    var price = this.$(".main-price em").text();
  	obj.price = price;
    var imgs = Array();
    this.$(".thumbnai-box").find("img").each(function(i, elem){
      realimg = $(this).attr("src");
      imgdata = realimg.split(".");
      imgs.push(realimg.replace("."+imgdata[imgdata.length-1],'f.'+imgdata[imgdata.length-1]));
    });
    obj.img = imgs;
    obj.currency = 'RMB';
  	return JSON.stringify(obj);
  };
}
