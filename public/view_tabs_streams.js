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
          st.max_id = stream.max_id;
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
        var li = $('<li data-type="stream" data-id="'+model.id+'"><span class="delete">x</span>'+model.label+'</li>');
        li.attr('data-label', model.label);
        $('#tabs ol#streams').append(li);
      });
    }
  }

  return Streams;
})();

