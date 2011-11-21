View.Tabs = (function(){

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
        View.Tabs.Streams.fetch(),
        View.Tabs.Timelines.fetch()
      ).done(function(){
        $.each(unreadStreams, function(id, _){
          $('#tabs #streams *[data-id="'+id+'"]').addClass('updated');
        });
        $.each(unreadTimelines, function(id, _){
          $('#tabs #timelines *[data-id="'+id+'"]').addClass('updated');
        });

        $('#tabs #streams > li').draggable({
          revert: "invalid",
          helper: "clone",
        });

        $('#tabs #timelines').sortable({
          "axis": "y",
          "item": "li[data-id]",
          "update": Timeline.saveOrder
        });

        $('#tabs #timelines > li').droppable({
          accept: $('#streams > li'),
          activeClass: "droppable-active",
          hoverClass: "droppable-hover",
          drop: function(ev, ui){
            var tl = new Timeline($(this).attr('data-id'));
            var st = new Stream(ui.draggable.attr("data-id"));
            tl.attach(st);
          }
        });
      });
    }, // init end

    check: function(){
      var pad = 0;
      $.each(View.Tabs.Timelines.getModels(), function(i, tl){
        $.each(tl.streams, function(i, st){
          setTimeout(function(){
            st.dry_load();
          }, ++pad * 600);
        });
      });
    }
  };
})();
