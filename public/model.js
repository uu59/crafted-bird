$.ajaxSetup({
  timeout: 7 * 1000
});

function Model() {}

Model.prototype.wrapDataPrefix = function(key){
  return "model-" + this.eventType + this.id + "-" + key;
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
  var args = args || {};
  if(!this.id){
    return $.Deferred();
  }
  var ajax = $.ajax({
    type: "GET",
    data: args || {},
    url: this.url("fetch"),
  });
  return ajax.progress(function(msg){
    switch(msg){
      case "abort":
        ajax.abort();
        ajax = null;
        break;
      default:
        console.log(arguments);
    }
  }).done(function(html, ajaxtype, d){
    // ajaxtype = success, error, etc
    var ret_max = d.getResponseHeader("X-Max-Id");
    self.setMaxId(ret_max);
  });
}

Model.prototype.bunch = function(){
  return new TweetsBunch(this);
}

Model.prototype.setMaxId = function(id){
  if(compare_big_number_string(id, this.max_id) == 1){
    this.max_id = id;
    Data.set(this.wrapDataPrefix("maxid"), id);
    Event.fire(this.eventType + ".tweets.fetched", this);
  }
}
