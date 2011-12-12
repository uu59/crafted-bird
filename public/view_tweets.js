View.Tweets = (function(){
  // fire when Stream fetch new tweet by Stream#fetch
  Event.trap('stream.tweets.fetched', function(ev){
    var stream = ev.data;
    $.each(stream.timelines, function(i, tl){
      tl.setMaxId(stream.max_id);
    });
  });

  Event.trap('stream.before.dryLoad', function(ev){
    var stream = ev.data;
    var d = stream.dryloading;
    View.loadingIcon(d).prependTo(stream.element());
    stream.timelines.forEach(function(tl){
      View.loadingIcon(d).prependTo(tl.element());
    });
  });

  Event.trap('stream.after.dryLoad', function(ev){
  });

  return {};
})();

