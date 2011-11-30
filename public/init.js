// emulate <a target="_blank">
$(document).delegate('a[href]', 'click', function(ev){
  if($(this).attr('data-name')){
    return ;
  }
  $(this).attr('target', '_blank');
  ev.preventDefault();
  click_link(this);
});

$(document).delegate(".thread", "click", function(ev){
  load_thread(this);
});


$(document).delegate('#postform #toggle-input-form', 'click', function(ev){
  ev.preventDefault();
  View.Post.toggle();
});

$(document).delegate('#tabs .reload', 'click', function(){
  View.Tabs.check();
});

$(document).delegate('#tabs #timelines > li .edit', 'click dblclick', function(ev){
  ev.preventDefault();
  ev.stopPropagation();
  var li = $(this).parent();
  $.ajax({
    type: "GET",
    url: "/timelines/"+li.attr('data-id')+'/setting'
  }).done(function(html){
    View.Popup.TimelineSetting.show(html);
  })
});

$(document).delegate('#tabs #streams > li', 'click dblclick', function(ev){
  Event.fire('tabs.click', {
    target: $(ev.target).closest('li'),
    origEv: ev
  });
});

$(document).delegate('#tabs #timelines > li', 'click dblclick', function(ev){
  Event.fire('tabs.click', {
    target: $(ev.target).closest('li'),
    origEv: ev
  });
});

$(document).delegate('#timeline-setting .delete', 'click', function(ev){
  ev.preventDefault();
  ev.stopPropagation();
  if(!confirm('really delete this Timeline?')){
    return ;
  }
  new Timeline($(this).closest('form[data-id]').attr('data-id')).destroy().always(function(){
    View.Tabs.init().done(function(){
      View.Popup.hide();
    });
  });
});

$(document).delegate('#timeline-setting .detach', 'click', function(ev){
  ev.preventDefault();
  ev.stopPropagation();
  var id = $(this).closest('form[data-id]').attr('data-id');
  var stid = $(this).closest('li').attr('data-id');
  var li = $(this).closest('li');
  var d = new Timeline(id).detach(new Stream(stid)).done(function(){
    li.remove();
    View.Tabs.init();
  });
  $(this).replaceWith(View.loadingIcon(d));
});

$(document).delegate('#timeline-setting input[name="label"]', 'keypress', function(ev){
  var id = $(this).closest('form[data-id]').attr('data-id');
  if(ev.keyCode == 13){
    ev.preventDefault();
    View.loadingIcon(
      $.ajax({
        type: "PUT",
        url: "/timelines/"+id,
        data: {"timeline": {label: $(this).val()}}
      }).always(function(){
        View.Tabs.init();
      })
    ).appendTo($(this).parent());
  }
});

// incremental search for Streams
$(document).delegate('#tabs input[name="streams_label"]', 'blur', function(ev){
  $(this).val("");
  $('#tabs #streams li').show();
});

$(document).delegate('#tabs input[name="streams_label"]', 'keyup', function(ev){
  var needle = $(this).val().toLowerCase();
  $('#tabs #streams li').each(function(i, li){
    var li = $(li);
    if(li.text().toLowerCase().indexOf(needle) == -1){
      li.hide();
    }else{
      li.show();
    }
  });
});

// create Timeline
$(document).delegate('#tabs input[name="timeline_label"]', 'keypress', function(ev){
  if(ev.keyCode != 13){
    return ;
  }
  var ipt = $(this);
  Timeline.create({
    "label": ipt.val()
  }).always(function(){
    ipt.val("");
  });
});

$(document).delegate('a.twitter-user', 'click', function(ev){
  ev.preventDefault();
  View.Popup.UserInfo.show(this);
});

$(document).delegate('.tweets a[data-hashtag]', 'click', function(ev){
  ev.preventDefault();
  var li = $(this).closest('li[data-context]');

  Stream.create({
    screen_name: $(li).attr("data-context"),
    method: "search",
    args: {"q": $(this).attr('data-hashtag')}
  });
});

$(document).delegate('#tweets .appendix span', 'click', function(ev){
  var self = $(this);
  if(this.className == "reply"){
    Event.fire('post.reply.click', self);
  }
  if(this.className == "reply-dm"){
    Event.fire('post.reply-dm.click', self);
  }
  if(this.className == "delete"){
    Event.fire('post.delete.click', self);
  }
  if(this.className == "rt") {
    Event.fire('post.rt.click', self);
  }
});

$(document).delegate('#tabs #streams .delete', 'click', function(ev){
  ev.preventDefault();
  ev.stopPropagation();
  var id = $(this).closest('li[data-id]').attr('data-id');
  (new Stream(id)).destroy();
});

$(document).delegate('#post .reset', 'click', function(ev){
  View.Post.reset();
  View.Post.close();
});

$(document).delegate('#post textarea', 'keypress keyup', function(ev){
  if(ev.type == "keypress" && ev.keyCode == 13 && ev.shiftKey){
    View.Post.update(this);
    return ;
  }
  $('#length').text(this.value.length + " / 140");
});

$(document).delegate('#post', 'submit', function(ev){
  ev.preventDefault();
});

$(document).delegate('#post #known_users img', 'click', function(){
  Event.fire('post.userimg.click', this);
});

// create Stream
$(document).delegate('#create-stream-button', 'click', function(ev){
  View.Popup.StreamCreation.toggle();
});

$(document).delegate('#popup .create-stream select[name="method"]', 'change', function(ev){
  switch($(this).val()){
    case "user_timeline":
    case "favorites":
    case "retweeted_by_user":
      var content = $('<p>id(screen_name): <input type="text" name="args[id]" value="" /></p>');
      break;
    case "search":
      var content = $('<p>q: <input type="text" name="args[q]" value="" /></p>');
      break;
    default:
      return ;
  }
  $('#contextual-fields').html(content);
});

$(document).delegate('#popup .create-stream', 'submit', function(ev){
  ev.preventDefault();
  View.Popup.hide();
  $('#popup .create-stream input').each(function(i, ipt){
    $(ipt).val($(ipt).val().replace(/(^\s*|\s*$)/g, ""));
  });
  if($('#popup .create-stream *[name="method"]').val() != "all"){
    var qs = $('#popup form').serialize();
    Stream.create(qs);
  }else{
    $.each(["home_timeline", "mentions", "dm"], function(i, method){
      $('#popup form *[name="method"]').val(method);
      var qs = $('#popup form').serialize();
      Stream.create(qs);
    });
  }
});

$(function(){
  View.adjustHeight();
  View.Tabs.init();
  window.setInterval(function(){
    View.Tabs.check();
  }, 300 * 1000);

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
  window.setInterval(function(){
    update_rate_limit();
  }, 120 * 1000);

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

