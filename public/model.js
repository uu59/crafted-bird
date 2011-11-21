function Model(id) {
}

Model.prototype.createCallback = function(type, fn, args){
  var self = this;
  return function(){
    // it's unnecessary yet
    // Event.fire(self.eventType + '.' + type, self);
    (fn || function(){}).apply(self, arguments);
  };
}

Model.prototype.url = function(){
  alert('override this method(Model#url)');
}

Model.prototype.fetch = function(args, callback){
  var callback = callback || {};
  var self = this;
  var args = $.extend(args || {}, {
    "max_id": self.max_id
  });
  if(!this.id){
    return $.Deferred();
  }
  return $.ajax({
    type: "GET",
    data: args || {},
    url: this.url("fetch"),
    beforeSend: self.createCallback("fetch-start", callback.beforeSend),
    complete: self.createCallback("fetch-complete", callback.complete),
    success: self.createCallback("fetch-success", callback.success),
    error: self.createCallback('fetch-error', callback.error)
  }).done(function(html, ajaxtype, d){
    // ajaxtype = success, error, etc
    var ret_max = d.getResponseHeader("X-Max-Id");
    if(compare_big_number_string(ret_max, self.max_id) == 1){
      Event.fire(self.eventType+'.tweets.fetched', {
        model: self,
        old_max: self.max_id,
        new_max: ret_max,
      });
      self.max_id = ret_max;
    }
  });
}

Model.prototype.activate = function(args){
  if(!this.id){
    return $.Deferred();
  }
  if(Model.d && !!Model.d.abort){
    console.log("abort", Model.d);
    Model.d.abort();
  }
  Event.fire('view.tweets.beforeChange', this);
  Model.d = this.fetch.call(this, args);
  Event.fire('view.tweets.change', {
    d: Model.d,
    model: this
  });
  Model.d.always(function(){
    Model.d = null;
  });
  return Model.d;
}
