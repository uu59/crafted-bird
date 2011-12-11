// manage bookmark/already read tweet

function TweetsBunch(model){
  this.model = model;
  this.type = model.eventType;
  var id = this.type + this.model.id;
  if(TweetsBunch.instances[id]){
    return TweetsBunch.instances[id];
  }
  this.id = id;
  this._elm = null;
  this.bookmark(Data.get('bunch-'+this.id+'-bookmark'));
  this.unreadCount(Data.get('bunch-'+this.id+'-unread'));
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
  var target, y = y || window.scrollY;
  y -= $('#tweets-info').offset().top;
  $('#tweets > li').each(function(i, li){
    y -= $(li).outerHeight(true);
    if(y <= 0){
      target = li;
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
        elm.attr('data-bookmark-id', this.bookmark());
        elm.attr('data-already-read-id', this.alreadyRead());
        break;
      case "stream":
        elm = $('<li data-type="stream" data-id="'+this.model.id+'"><em class="unread"></em><span class="delete">x</span>'+this.model.label+'</li>');
        elm.attr('data-label', this.model.label);
        elm.attr('data-bookmark-id', this.bookmark());
        elm.attr('data-already-read-id', this.alreadyRead());
        break;
    }
    this._elm = elm;
    return this._elm;
  },

  alreadyRead: function(id){ /* getter/setter */
    var datakey = 'bunch-' + this.id + '-alreadyRead';
    if(!id){
      return Data.get(datakey);
    }
    var oldid = Data.get(datakey);
    if(compare_big_number_string(oldid, id) == -1){
      Data.set(datakey, id);
      this.element().attr('data-already-read-id', id);
    }
    return Data.get(datakey);
  },

  bookmark: function(id){ /* getter/setter */
    var datakey = 'bunch-'+this.id+'-bookmark';
    if(!id){
      return Data.get(datakey);
    }
    Data.set(datakey, id); 
    this.element().attr('data-bookmark-id', id);
    return this.bookmark();
  },

  unreadCount: function(cnt){
    if(!cnt){
      return ;
    }
    var cnt = parseInt(cnt);
    Data.set('bunch-'+this.id+'-unread', cnt); 
    if(cnt > 300){
      $('.unread', this.element()).html("(300+)");
    }else{
      $('.unread', this.element()).html("("+cnt+")");
    }

    if(cnt > 0 && TweetsBunch.current != this){
      this.model.element().addClass('updated');
    }else{
      this.model.element().removeClass('updated');
    }
  },

  checkUnread: function(){
    var self = this;
    $.ajax({
      type: "GET",
      url: "/timelines/"+this.model.id+"/unread/"+(this.alreadyRead() || 0)
    }).done(function(res){
      self.unreadCount(res);
    });
  },

  finalizer: function(){
    var current = TweetsBunch.current;
    if(current){
      var target = TweetsBunch.getThisPositionedTweet(window.scrollY);
      current.bookmark($(target).attr('data-id'));
      current.alreadyRead($(target).attr('data-id'));
    }
  },

  activate: function(){
    var self = this;
    Sound.play("changeTweets");
    this.finalizer();

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
        // if bookmark id exists, scroll to there
        if(id && $("#tweets li[data-id="+id+"]").length > 0){
          to = $("#tweets li[data-id="+id+"]").offset().top - pad;
        }else{
          // if alreadyRead id exits, scroll to there.
          // else 
          var maxid = self.alreadyRead();
          if(maxid && $('#tweets li[data-id="'+maxid+'"]').length > 0) {
            to = $('#tweets li[data-id="'+maxid+'"]').offset().top - pad;
          }else{
            to = $('#tweets').height();
          }
        }
      }catch(e){
        var to = 0;
      }

      window.scroll(0, to);
      if(TweetsBunch.current == self){
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
  if(TweetsBunch.current == tl.bunch()){
    TweetsBunch.activate();
  }
  tl.bunch().checkUnread();
});

Event.trap('stream.after.dryLoad', function(ev){
  var stream = ev.data;
  stream.timelines.forEach(function(tl){
    tl.bunch().checkUnread();
  });
});
