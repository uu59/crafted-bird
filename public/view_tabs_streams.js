View.Tabs.Streams = (function(){
  var models = []; // known Stream models

  var Streams = {
    getModels: function(){ return models; },

    fetch: function(){
      var d = $.getJSON('/streams', function(streams){
        models = [];
        $.each(streams, function(i, stream){
          var st = new Stream(stream.id);
          st.label = stream.label;
          st.setMaxId(stream.max_id);
          models.push(st);
        });
        Streams.render();
      });
      $('#tabs #streams').html(View.loadingIcon(d));
      return d;
    },

    render: function(){
      $('#tabs #streams').html("");
      $.each(models, function(i, model){
        var bunch = new TweetsBunch(model);
        $('#tabs ol#streams').append(bunch.element());
      });
    }
  }

  return Streams;
})();

