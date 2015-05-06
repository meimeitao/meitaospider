module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("#name h1").text().trim();
    obj.price = this.$("#jd-price").text().trim();
    var imgs = Array();
    this.$("#spec-list .spec-items").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace('/n5/','/n0/'));
    });
    obj.img = imgs;
    this.$("body").find("link").each(function(i, elem){
      obj.url = $(this).attr("href");
    });
    obj.currency = 'RMB';
    obj.en = 'jd';
  	return JSON.stringify(obj);
  };
}
