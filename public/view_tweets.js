View.Tweets = (function(){
  var current; // Timeline or Stream model
  var bookmark = {}; // memoize current position tweet

  var Tweets = {
    setCurrent: function(model){ current = model; },
    getCurrent: function(){ return current; },
    setCurrentTweet: function(li) {
      bookmark[current.id] = li;
      $(current.element()).attr('data-bookmark-id', $(li).attr('data-id'));
    },
    getCurrentTweet: function(){
      return bookmark[current.id];
    },
    reload: function(){
      current.activate();
    }
  }

  Event.trap('timeline.tweets.fetched', function(ev){
    var tl = ev.data.model;
    var elm = $(tl.element());

    if(compare_big_number_string(ev.data.old_max, ev.data.new_max) == -1){
      elm.attr('data-bookmark-id', elm.attr('data-bookmark-id') || tl.max_id);
      tl.max_id = ev.data.new_max;
      if(View.Tweets.getCurrent() == tl){
        tl.activate();
      }else{
        $(tl.element()).addClass('updated');
      }
    }
  });

  Event.trap('stream.tweets.fetched', function(ev){
    var stream = ev.data.model;
    var elm = $(stream.element());
    elm.addClass('updated');
    if(!elm.attr('data-bookmark-id')){
      elm.attr('data-bookmark-id', ev.data.old_max);
    }
    $.each(stream.timelines, function(i, tl){
      Event.fire('timeline.tweets.fetched', {
        model: tl,
        old_max: tl.max_id,
        new_max: ev.data.new_max
      });
    });
  });

  Event.trap('view.tweets.beforeChange', function(ev){
    if(Tweets.getCurrent()){
      var y = window.scrollY, target;
      $('#tweets > li').each(function(i, li){
        y -= $(li).outerHeight(true);
        if(y <= 0){
          if(i == 0){
            target = li;
          }else{
            target = $(li).next()[0] || li;
          }
          return false;
        }
      });
      Tweets.setCurrentTweet($(target).attr("data-id"));
    }
    Sound.play("changeTweets");
  });

  Event.trap('view.tweets.change', function(ev){
    ev.data.d.done(function(html, type, d){
      var model = ev.data.model;
      var same = false;
      if(Tweets.getCurrent() == model){
        same = true;
      }
      Tweets.setCurrent(model);
      model.element().removeClass('updated');
      $('#main').html(html).promise().done(function(){
        var id = Tweets.getCurrentTweet();
        var pad = $('#tweets').offset().top;
        if(id && $("#tweets li[data-id="+id+"]").length > 0){
          var to = $("#tweets li[data-id="+id+"]").offset().top - pad;
        }else{
          var maxid = $(model.element()).attr('data-bookmark-id') || model.max_id;
          if(maxid) {
            try {
              var to = $('#tweets li[data-id="'+maxid+'"]').offset().top - pad;
            }catch(e){
              var to = 0;
            }
          }else{
            var to = $('#tweets').height();
          }
        }
        if(!same){
          window.scroll(0, to);
        }
        $('#tweets-line').height(to);
      });
    });
  });


  return Tweets;
})();

