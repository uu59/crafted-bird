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
    this.dryloading.notify("abort");
    this.dryloading = null;
    console.log("duplicating dry load: " + this.label);
  }
  var self = this;
  var d = this.fetch({"force": true}).always(function(){
    self.dryloading = null;
  });
  this.dryloading = d;
  View.loadingIcon(d).prependTo(this.element());
  this.timelines.forEach(function(tl){
    View.loadingIcon(d).prependTo(tl.element());
  });
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
