View.Tweets = (function(){
  var current; // Timeline or Stream model
  var bookmark = {}; // memoize current position tweet

  var Tweets = {
    setCurrent: function(model){ current = model; },
    getCurrent: function(){ return current; },
    reload: function(){
      current.activate();
    }
  }

  Event.trap('timeline.tweets.fetched', function(ev){
    var tl = ev.data;
    var elm = $(tl.element());

    if(compare_big_number_string(ev.data.old_max, ev.data.new_max) == -1){
      tl.max_id = ev.data.new_max;
      if(View.Tweets.getCurrent() == tl){
        tl.activate();
      }else{
        $(tl.element()).addClass('updated');
      }
    }
  });

  Event.trap('stream.tweets.fetched', function(ev){
    var stream = ev.data;
    var elm = $(stream.element());
    elm.addClass('updated');
    $.each(stream.timelines, function(i, tl){
      tl.setMaxId(ev.data.new_max);
    });
  });

  Event.trap('view.tweets.beforeChange', function(ev){
    var model = Tweets.getCurrent();
    if(model){
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
      model.element().attr('data-bookmark-id', $(target).attr('data-id'));
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
        var pad = $('#tweets').offset().top;
        var to, id;
        if(model.element().attr('data-bookmark-id')){
          var id = model.element().attr('data-bookmark-id');
        }
        try {
          if(id && $("#tweets li[data-id="+id+"]").length > 0){
            to = $("#tweets li[data-id="+id+"]").offset().top - pad;
            console.log('match', id);
          }else{
            console.log('none match', id);
            var maxid = model.max_id;
            if(maxid) {
              to = $('#tweets li[data-id="'+maxid+'"]').offset().top - pad;
            }else{
              to = $('#tweets').height();
            }
          }
        }catch(e){
          var to = 0;
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

