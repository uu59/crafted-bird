View.Tabs = (function(){

  function init(){
    $('#tabs #streams > li').draggable('destroy').draggable({
      revert: "invalid",
      helper: "clone",
    });

    $('#tabs #timelines').sortable('destroy').sortable({
      "axis": "y",
      "item": "li[data-id]",
      "update": Timeline.saveOrder
    });

    $('#tabs #timelines > li').droppable('destroy').droppable({
      accept: $('#tabs #streams > li'),
      activeClass: "droppable-active",
      hoverClass: "droppable-hover",
      drop: function(ev, ui){
        var tl = new Timeline($(this).attr('data-id'));
        var st = new Stream(ui.draggable.attr("data-id"));
        tl.attach(st);
      }
    });
  }

  function loadStreams() {
    var d = $.getJSON('/streams', function(streams){
      models = [];
      streams.forEach(function(stream){
        var st = new Stream(stream.id);
        st.label = stream.label;
        st.setMaxId(stream.max_id);
        models.push(st);
      });

      $('#tabs #streams').html("");
      models.forEach(function(model){
        var bunch = new TweetsBunch(model);
        $('#tabs ol#streams').append(bunch.element());
      });
    });
    $('#tabs #streams').html(View.loadingIcon(d));
    return d;
  }

  function loadTimelines() {
    var d = $.getJSON('/timelines', function(tls){
      models = [];
      var order = Data.get('timelineOrder');
      if(order){
        tls.sort(function(a,b){
          return order.indexOf(a.id) - order.indexOf(b.id);
        });
      }
      tls.forEach(function(timeline){
        var tl = new Timeline(timeline.id);
        tl.label = timeline.label;
        tl.setMaxId(Data.get(tl.wrapDataPrefix("maxid")) || 1);
        tl.streams = [];
        timeline.streams.forEach(function(st){
          var stream = new Stream(st.id);
          stream.label = st.label;
          stream.timelines.push(tl);
          stream.timelines = $.unique(stream.timelines);
          tl.streams.push(stream);
        });
        tl.streams = $.unique(tl.streams);
        models.push(tl);
      });

      $('#tabs #timelines').html('');
      models.forEach(function(model){
        var bunch = new TweetsBunch(model);
        $('#tabs #timelines').append(bunch.element());
      });
    });
    $('#tabs #timelines').html(View.loadingIcon(d));
    return d;
  }

  return {
    init: function(){
      var unreadStreams = {}, unreadTimelines = {};
      $('#tabs #streams li.updated').each(function(i, li){
        var id = $(li).attr('data-id');
        unreadStreams[id] = true;
      });
      $('#tabs #timelines li.updated').each(function(i, li){
        var id = $(li).attr('data-id');
        unreadTimelines[id] = true;
      });

      return $.when(
        loadStreams(),
        loadTimelines()
      ).done(function(){
        init();
        $.each(unreadStreams, function(id, _){
          $('#tabs #streams *[data-id="'+id+'"]').addClass('updated');
          (new TweetsBunch(id)).checkUnread();
        });
        $.each(unreadTimelines, function(id, _){
          $('#tabs #timelines *[data-id="'+id+'"]').addClass('updated');
        });
      });
    },

    check: function(){
      var streams = [], parallelLevel = 2;
      var nextjob = function(){
        var st = streams.shift();
        if(!st){
          return ;
        }
        st.dry_load().always(function(){
          nextjob();
        });
      }
      $.each(View.Tabs.Timelines.getModels(), function(i, tl){
        $.each(tl.streams, function(i, st){
          streams.push(st);
          streams = $.unique(streams);
        });
      });
      while(--parallelLevel >= 0){
        setTimeout(function(){
          nextjob();
        }, 500 * parallelLevel);
      }
    }
  };
})();
