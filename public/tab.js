function Tab(model){
  this.model = model;
  this.id = this.model.eventType + this.model.id;

  var self = this;
  ["bookmark", "alreadyRead"].forEach(function(prop){
    self.__defineSetter__(prop, function(value){
      if(value){
        Data.set('bunch-' + self.id + '-' + prop, value);
      }
      return value;
    });
    self.__defineGetter__(prop, function(){
      var val= Data.get('bunch-' + self.id + '-' + prop) || "1";
      return val;
    });
  });

  this.__defineSetter__("unread", function(value){
    if(value == 0){
      self.element().removeClass('updated');
    }else{
      self.element().addClass('updated');
    }
    $('.unread', self.element()).html('('+(value > 300 ? "300+" : value) +')');
    return value;
  });
}

(function(){
  var loading = null;
  var current = null;

  function currentPositionTweet(){
    var pad = $('#tweets').offset().top;
    var y = window.scrollY + pad;
    var tweets = $('#tweets > *[data-id]');
    if(y - pad <= 0){
      return tweets[0];
    }
    var head = 0, tail = tweets.length - 1, idx = -1;
    while(head <= tail){
      var idx = Math.floor((head + tail) / 2);
      var pos = tweets[idx].offsetTop;
      if(y == pos) break;
      if(y < pos) {
        tail = idx - 1;
      }else{
        head = idx + 1;
      }
    }
    return tweets[idx];
  }

  Tab.prototype = {
    element: function(){
      if(this._elm){
        return this._elm;
      }
      var elm;
      switch(this.model.eventType){
        case "timeline":
          elm = $('<li data-type="timeline"><span class="edit" data-timeline-id="'+this.model.id+'">⚙</span>'+this.model.label+'<small class="unread">(0)</small></li>');
          elm.attr('data-id', this.model.id);
          break;
        case "stream":
          elm = $('<li data-type="stream"><em class="unread"></em><span class="delete">x</span>'+this.model.label+'</li>');
          elm.attr('data-id', this.model.id);
          elm.attr('data-label', this.model.label);
          break;
      }
      elm[0].tab = this;
      this._elm = elm;
      this.checkUnread();
      return this._elm;
    },

    checkUnread: function(){
      var self = this;
      if(this.model.eventType != "timeline"){
        return;
      }
      $.ajax({
        type: "GET",
        url: "/timelines/"+this.model.id+"/unread/"+this.alreadyRead
      }).done(function(res){
        self.unread = res;
      });
    },

    activate: function(){
      if(loading){
        loading.abort();
        loading = null;
      }
      loading = this.model.fetch();
      var self = this;
      loading.done(function(html){
        loading = null;
        self.element().removeClass('updated');
        self.element().addClass('active');
        var to, currentId;
        if(current) {
          current.deactivate();
        }
        if(self == current){
          tw = $(currentPositionTweet());
          var pad = ($('#tweets').offset() || {top: 0}).top;
          to = tw.position().top - pad;
        }
        $('#main').html(html).promise().done(function(){
          var pad = ($('#tweets').offset() || {top: 0}).top;
          if(self != current){
            var offset = $('#tweets > *[data-id="'+self.bookmark +'"], #tweets > *[data-id="'+self.alreadyRead+'"]').offset();
            if(offset){
              to = offset.top - pad;
            } else {
              to = $('#tweets').height();
            }
          }
          $('#tweets-line').height(($('#tweets > *[data-id="'+self.bookmark+'"]').offset() || {top:0}).top - pad);
          $('#tweets-line-unread').height(($('#tweets > *[data-id="'+self.alreadyRead+'"]').offset() || {top:0}).top - pad);
          window.scroll(0, to);
          current = self;
        });
      });
      return loading;
    },

    deactivate: function(){
      var target = currentPositionTweet();
      this.element().removeClass('active');
      var id = $(target).attr('data-id');
      this.bookmark = id;
      if(compare_big_number_string(this.alreadyRead, id) == -1){
        this.alreadyRead = id;
      }
    },
  }

  Event.trap('timeline.tweets.fetched', function(ev){
    var tl = ev.data;
    if(current && current == tl.tab){
      current.activate();
    }
  });

  Event.trap('stream.after.dryLoad', function(ev){
    var stream = ev.data;
    stream.timelines.forEach(function(tl){
      tl.tab.checkUnread();
    });
  });
})();
