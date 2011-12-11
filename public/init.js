$(function(){
  window.addEventListener('beforeunload', function(e){
    try {
      TweetsBunch.current.finalizer();
    }catch(e){}
  }, false);

  window.addEventListener("resize", function(){
    View.adjustHeight();
  }, false);

  View.adjustHeight();
  View.Tabs.init();
  function autoreload(){
    window.setTimeout(function(){
      View.Tabs.check();
      autoreload();
    }, 300 * 1000);
  }

  var update_rate_limit = function(){
    $.ajax({
      url: '/users/limits',
      type: "GET",
      success: function(limit){
        $('#known_users img').each(function(i, img){
          var rate = limit[$(img).attr('data-user')].remaining_hits;
          $(img).attr('data-rate-limit', rate);
          $(img).attr('title', "Limit: "+rate + "("+(new Date())+")");
        });
      },
    });
  }
  update_rate_limit();
  //window.setInterval(function(){
  //  update_rate_limit();
  //}, 137 * 1000);

  if(Sound.isDummy){
    $('#volume-slider').hide();
    $('#volume-value').hide();
  }
  $('#volume-value').html(Sound.DEFAULT_VOL);
  $('#volume-slider').slider({
    value: Sound.DEFAULT_VOL,
    min: 0.0,
    max: 1.0,
    step: 0.1,
    slide: function(ev, ui){
      $('#volume-value').html(ui.value);
    },
    change: function(ev, ui){
      Sound.changeVolume(ui.value);
      Sound.play("sample");
    }
  });
});

