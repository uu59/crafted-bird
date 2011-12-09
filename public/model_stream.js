function Stream(id){
  if(Stream.instances[id]){
    return Stream.instances[id];
  }
  this.eventType = "stream";
  this.id = id;
  this.max_id = "0";
  this.timelines = [];
  this.dryloading = null;
  Stream.instances[this.id] = this;
}

$.extend(Stream.prototype, Model.prototype);

Stream.instances = {};
Stream.create = function(query){
  var d = $.ajax({
    url: "/stream/create",
    data: query ,
    type: "POST",
  }).done(function(id){
    if(id.match(/^[0-9]+$/)){
      View.Tabs.init();
      (new Stream(id)).dry_load();
    }
  }).fail(function(ajax){
    console.log("Stream.create error: ", ajax.responseText);
  });
  View.TransStatus.add("creating stream", d);
  return d;
}

Stream.prototype.element = function(){
  return $('#streams li[data-id="'+this.id+'"]');
}

Stream.prototype.dry_load = function(){
  if(this.dryloading){
    this.dryloading.abort();
    this.dryloading = null;
    console.log("duplicating dry load: " + this.label);
  }
  var self = this;
  var d = $.ajax({
    type: "HEAD",
    url: "/streams/"+this.id+"/reload"
  });
  d.done(function(){
    Event.fire('stream.after.dryLoad', self);
  }).always(function(){
    self.dryloading = null;
    d = null;
  });

  this.dryloading = d;
  Event.fire('stream.before.dryLoad', this);
  return d;
}

Stream.prototype.url = function(type){
  switch(type){
    default:
    return "/streams/"+this.id;
  }
}

Stream.prototype.destroy = function(){
  var d = $.ajax({
    url: "/streams/"+this.id,
    type: "DELETE"
  }).done(function(){
    View.Tabs.init();
  });
  View.TransStatus.add('deleting '+this.label, d);
  return d;
}
