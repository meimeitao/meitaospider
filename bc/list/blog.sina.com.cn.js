module.exports = function($, url) {
  var urls = require('url');
  this.getJSON = function() {
    var obj = {};
    obj.urls = $('.bloglist .blog_title_h .blog_title a').map(function(){
      return $(this).attr('href');
    }).toArray();
    var rss = $('[title=RSS]').attr('href');
    var matched = /rss\/(\d+)\.xml$/.exec(rss);
    if (matched) {
      var pageId = matched[1];
      var page = $('.SG_page');
      if (page) {
        var total = page.attr('total');
        var pagesize = page.attr('pagesize');
        var totalPages = Math.ceil(total / pagesize);
        obj.pages = [];
        for (var i = 2; i <= totalPages; ++i) {
          var path = '/s/article_sort_' + pageId + '_10001_' + i + '.html';
          obj.pages.push(urls.resolve(url, path));
        }

      }
    }

    return JSON.stringify(obj);
  }
}
