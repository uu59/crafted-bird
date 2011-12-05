View.Tabs.Timelines = (function(){
  var models = {}; // known Timeline models

  var Timelines = {
    getModels: function(){ return models; },

    fetch: function(){
      var d = $.getJSON('/timelines', function(tls){
        models = [];
        var order = Data.get('timelineOrder');
        if(order){
          tls.sort(function(a,b){
            return order.indexOf(a.id) - order.indexOf(b.id);
          });
        }
        $.each(tls, function(i, timeline){
          var tl = new Timeline(timeline.id);
          tl.label = timeline.label;
          tl.setMaxId(Data.get(tl.wrapDataPrefix("maxid")) || 1);
          tl.streams = [];
          $.each(timeline.streams, function(i, st){
            var stream = new Stream(st.id);
            stream.label = st.label;
            stream.timelines.push(tl);
            stream.timelines = $.unique(stream.timelines);
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
      $.each(models, function(i, model){
        var bunch = new TweetsBunch(model);
        $('#tabs #timelines').append(bunch.element());
      });
    }
  }

  return Timelines;
})();
