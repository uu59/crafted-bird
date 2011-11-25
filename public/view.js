var View = (function(){
  var loadingIconCounter = 0;

  var View = {
    loadingIcon: function(d){
      ++loadingIconCounter;
      var img = $('<img class="loading" data-counter="'+loadingIconCounter+'" src="/images/loading.gif" />');
      d.promise().always(function(){
        img.remove();
      });
      return img; 
    },

    adjustHeight: function(){
      var postform_h = $('#postform').height();
      $('#main').css('padding-top', postform_h+"px");
      $('#tabs').css('top', postform_h+"px");
      $('#tweets-line').css({"top": postform_h + "px" });

      var tabs_h = window.innerHeight - $('#postform').height();
      $('#tabs').css({
        height: tabs_h + "px"
      });
    }
  };

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
