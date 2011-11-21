var Debug = {
  reloadCSS: function(){
    var css = $('link[rel="stylesheet"]');
    var dup = css.clone();
    css.remove();
    dup.each(function(i, elm){
      var href = $(elm).attr('href').replace(/\?.*$/, "");
      $(elm).attr('href', href + "?" + (new Date()).getTime());
    });
    dup.appendTo('head');
  },

  reloadScripts: function(){
    var scripts = $('script[src]');
    var dup = scripts.clone();
    scripts.remove();
    dup.appendTo('head');
  }
}
