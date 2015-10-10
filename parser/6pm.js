module.exports = function($) {
    this.$ = $;
    this.getJSON = function() {
        var obj = {};
        var title = this.$("title").text().split("-");
        obj.title = title[0].replace(/(^\s*)|(\s*$)/g, "");
        var price = this.$("#priceSlot .price").text().trim();
        obj.price = price;
        var imgs = Array();
        obj.img = imgs;
        obj.currency = 'USD';
        obj.en = '6PM';
        return JSON.stringify(obj);
    };
};