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
        $(document).undelegate('.appendix .create-user-stream', 'click', Popup.UserInfo.createStreamHandler);
        $(document).delegate('.appendix .create-user-stream', 'click', Popup.UserInfo.createStreamHandler);
        show();
        var a = $(a);
        var d = $.ajax({
          type: "GET",
          url: "/userinfo/"+a.closest('*[data-context]').attr('data-context')+"/"+a.attr('data-name')
        }).done(function(res){
          elm.html(res);
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
