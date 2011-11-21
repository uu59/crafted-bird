var View = (function(){
  var loadingIconCounter = 0;

  var View = {
    loadingIcon: function(d){
      ++loadingIconCounter;
      var img = $('<img data-counter="'+loadingIconCounter+'" src="/images/loading.gif" />');
      d.promise().always(function(){
        img.remove();
      });
      return img; 
    }
  };

  Event.trap('timeline.tweets.fetched', function(ev){
    var tl = ev.data.model;
    var elm = $(tl.element());
    if(!elm.attr('data-bookmark-id')){
      elm.attr('data-bookmark-id', ev.data.old_max);
    }

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

  Event.trap('tabs.click', function(ev){
    var origEv = ev.data.origEv;
    var target = ev.data.target;
    var id = target.attr('data-id');
    var model = (target.attr('data-type') == "stream" ? new Stream(id) : new Timeline(id));
    if(!model){
      return;
    }
    var force = (origEv.type == "dblclick" || origEv.shiftKey);
    var d = model.activate({"force": force}).promise();
    View.TransStatus.add('loading '+model.url('fetch'), d);
  });

  return View;
})();
