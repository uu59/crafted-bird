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

  Event.trap('tabs.click', function(ev){
    var origEv = ev.data.origEv;
    var target = ev.data.target;
    var id = target.attr('data-id');
    var model = (target.attr('data-type') == "stream" ? new Stream(id) : new Timeline(id));
    if(!model){
      return;
    }
    var force = (origEv.type == "dblclick" || origEv.shiftKey);
    var d = model.tab.activate();
    View.TransStatus.add('loading '+model.url('fetch'), d);
  });

  return View;
})();
