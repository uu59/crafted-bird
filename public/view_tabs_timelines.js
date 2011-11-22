View.Tabs.Timelines = (function(){
  var models = {}; // known Timeline models

  var Timelines = {
    getModels: function(){ return models; },

    fetch: function(){
      var d = $.getJSON('/timelines', function(tls){
        models = [];
        $.each(tls, function(i, timeline){
          var tl = new Timeline(timeline.id);
          tl.label = timeline.label;
          tl.max_id = timeline.max_id;
          $(tl.element()).attr('data-bookmark-id', tl.max_id);
          tl.streams = [];
          $.each(timeline.streams, function(i, st){
            var stream = new Stream(st.id);
            stream.label = st.label;
            stream.timelines.push(tl);
            tl.streams.push(stream);
          });
          tl.streams = $.unique(tl.streams);
          models.push(tl);
        });
        Timelines.render();
      });
      $('#tabs #timelines').html(View.loadingIcon(d));
      return d;
    },

    render: function(){
      $('#tabs #timelines').html("");
      $.each(models, function(i, tl){
        var html_tl = $('<li data-type="timeline" data-id="'+tl.id+'"><span class="edit" data-timeline-id="'+tl.id+'">⚙</span>'+tl.label+'<small>('+tl.streams.length+')</small></li>');
        $('#tabs #timelines').append(html_tl);
      });
    }
  }

  return Timelines;
})();
