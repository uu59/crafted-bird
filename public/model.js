$.ajaxSetup({
  timeout: 7 * 1000
});

function Model() {}

Model.prototype.wrapDataPrefix = function(key){
  return "model-" + this.eventType + this.id + "-" + key;
}

Model.prototype.url = function(){
  alert('override this method(Model#url)');
}

Model.prototype.fetch = function(args){
  var self = this;
  var args = args || {};
  var ajax = $.ajax({
    type: "GET",
    data: args || {},
    url: this.url("fetch"),
  });
  ajax.done(function(html, ajaxtype, d){
    // ajaxtype = success, error, etc
    var ret_max = d.getResponseHeader("X-Max-Id");
    self.setMaxId(ret_max);
  });
  return ajax;
}

Model.prototype.setMaxId = function(id){
  if(compare_big_number_string(id, this.max_id) == 1){
    this.max_id = id;
    Data.set(this.wrapDataPrefix("maxid"), id);
    Event.fire(this.eventType + ".tweets.fetched", this);
  }
}
