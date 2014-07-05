module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
  	obj.price = this.$("#priceblock_ourprice").text();
  	return JSON.stringify(obj);
  };
}