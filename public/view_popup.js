View.Popup = (function(){
  var elm;
  $(function(){
    elm = $('#popup');
  });
  var closeButton = $('<span class="close">×</span>');

  var outerClickHandler = function(ev){
    if($(ev.target).hasClass('twitter-user')){
      return ;
    }
    if($(ev.target).closest(elm).length == 0){
      hide();
    }
    if(ev.target == closeButton[0]){
      hide();
    }
  }

  function show(){
    if(elm.is(':hidden')){
      hide();
    }
    elm.append(closeButton);
    elm.show();
    $(document).undelegate('', 'click', outerClickHandler);
    $(document).delegate('', 'click', outerClickHandler);
  }

  function hide(){
    elm.hide();
    $(document).undelegate('', 'click', outerClickHandler);
    $(document).undelegate('.appendix .create-user-stream', 'click', Popup.UserInfo.createStreamHandler);
  }


  var Popup = {
    hide: function(){
      hide();
    },

    UserInfo: {
      createStreamHandler: function(ev){
        var li = $(ev.target).closest('*[data-context]');
        Stream.create({
          screen_name: li.attr("data-context"),
          method: "user_timeline",
          args: {"screen_name": li.attr("data-name")}
        });
      },

      show: function(a){
        $(document).delegate('.appendix .create-user-stream', 'click', Popup.UserInfo.createStreamHandler);
        show();
        var a = $(a);
        var context = a.closest('*[data-context]').attr('data-context');
        var target = a.attr('data-name');
        var d = $.ajax({
          type: "GET",
          url: "/userinfo/"+context+"/"+target
        }).done(function(res){
          elm.html(res);
          var d_info = $.ajax({
            type: "GET",
            url: "/userinfo/"+context+'/'+target+'/info'
          }).done(function(res){
            $('#user', elm).html(res);
          });
          var d_stream = $.ajax({
            type: "GET",
            url: "/userinfo/"+context+"/"+target+"/stream"
          }).done(function(res){
            $('.tweets', elm).html(res);
          });
          View.loadingIcon(d_info).appendTo('#user');
          View.loadingIcon(d_stream).appendTo('.tweets');
          show();
        }).fail(function(){
          hide();
        });
        var img = View.loadingIcon(d);
        elm.html(img);
      }
    },

    TimelineSetting: {
      show: function(html){
        elm.html(html);
        show();
      },
      hide: function(){
        hide();
      }
    },

    StreamCreation: {
      show: function(){
        elm.html($('#create-form').html());
        show();
      },
      hide: function(){
        hide();
      },
      toggle: function(){
        elm.is(':visible') ? this.hide() : this.show();
      }
    }
  };

  return Popup;
})();
