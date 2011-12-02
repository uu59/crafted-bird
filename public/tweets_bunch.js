// manage bookmark/already read tweet

function TweetsBunch(model){
  this.model = model;
  this.type = model.eventType;
  var id = this.type + this.model.id;
  if(TweetsBunch.instances[id]){
    return TweetsBunch.instances[id];
  }
  this._elm = null;
  TweetsBunch.instances[id] = this;
}

TweetsBunch.current = null;
TweetsBunch.instances = {};
TweetsBunch.clear = function(){ /* for View.Tabs.init() */
  $.each(TweetsBunch.instances, function(i, tb){
    tb.element().remove();
  });
  TweetsBunch.instances = {};
}

TweetsBunch.getThisPositionedTweet = function(y){
  var y = y || window.scrollY, target;
  $('#tweets > li').each(function(i, li){
    y -= $(li).outerHeight(true);
    if(y <= 0){
      target = $(li).next()[0] || li;
      return false;
    }
  });
  return target;
}

TweetsBunch.prototype = {
  element: function(){
    if(this._elm){
      return this._elm;
    }
    var elm;
    switch(this.type){
      case "timeline":
        elm = $('<li data-type="timeline"><span class="edit" data-timeline-id="'+this.model.id+'">⚙</span>'+this.model.label+'<small class="unread">(0)</small></li>');
        elm.attr('data-id', this.model.id);
        elm.attr('data-bookmark-id', this.model.max_id);
        elm.attr('data-already-read-id', this.model.max_id);
        break;
      case "stream":
        elm = $('<li data-type="stream" data-id="'+this.model.id+'"><em class="unread"></em><span class="delete">x</span>'+this.model.label+'</li>');
        elm.attr('data-label', this.model.label);
        elm.attr('data-bookmark-id', this.model.max_id);
        elm.attr('data-already-read-id', this.model.max_id);
        break;
    }
    this._elm = elm;
    return this._elm;
  },

  alreadyRead: function(id){ /* getter/setter */
    if(!id){
      return this.element().attr('data-already-read-id');
    }
    var oldid = this.alreadyRead();
    if(compare_big_number_string(oldid, id) == -1){
      this.element().attr('data-already-read-id', id);
    }
    return this.alreadyRead();
  },

  bookmark: function(id){ /* getter/setter */
    if(!id){
      return this.element().attr('data-bookmark-id');
    }
    this.element().attr('data-bookmark-id', id);
    return this.bookmark();
  },

  unreadCount: function(cnt){
    $('.unread', this.element()).html("("+cnt+")");
  },

  activate: function(){
    var self = this;
    var current = TweetsBunch.current;
    if(current){
      var target = TweetsBunch.getThisPositionedTweet(window.scrollY);
      current.bookmark($(target).attr('data-id'));
      current.alreadyRead($(target).attr('data-id'));
    }
    Sound.play("changeTweets");

    if(TweetsBunch.changing){
      TweetsBunch.changing.abort();
      TweetsBunch.changing = null;
      console.log('abort activate ', this.model.label)
    }
    var d = this.model.fetch();
    TweetsBunch.changing = d;
    d.done(function(html){
      TweetsBunch.changing = null;
      $('#main').html(html);
      self.model.element().removeClass('updated');
      var pad = $('#tweets').offset().top;
      var to, id = self.bookmark();
      try {
        if(id && $("#tweets li[data-id="+id+"]").length > 0){
          to = $("#tweets li[data-id="+id+"]").offset().top - pad;
        }else{
          var maxid = bunch.alreadyRead();
          if(maxid) {
            to = $('#tweets li[data-id="'+maxid+'"]').offset().top - pad;
          }else{
            to = $('#tweets').height();
          }
        }
      }catch(e){
        var to = 0;
      }

      window.scroll(0, to);
      if(current == self){
        $('#tweets-line').height(TweetsBunch.getThisPositionedTweet($('#tweets-line').height()));
      }else{
        $('#tweets-line').height(to);
      }
      TweetsBunch.current = self;
    });
    return d;
  }
}

Event.trap('timeline.tweets.fetched', function(ev){
  var tl = ev.data;
  var bunch = tl.bunch();
  $.ajax({
    type: "GET",
    url: "/timelines/"+tl.id+"/unread/"+bunch.alreadyRead()
  }).done(function(res){
    bunch.unreadCount(res);
  });
});
