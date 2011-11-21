function Timeline(id){
  if(Timeline.instances[id]){
    return Timeline.instances[id];
  }
  this.eventType = "timeline";
  this.id = id;
  this.max_id = 0;
  this.streams = [];
  Timeline.instances[this.id] = this;
}

$.extend(Timeline.prototype, Model.prototype);

Timeline.instances = {}
Timeline.saveOrder = function() {
  var order = [];
  $('#tabs #timelines li[data-id]').each(function(i, tl){
    order.push($(tl).attr('data-id'));
  });
  return $.ajax({
    url: "/timelines/order",
    type: "PUT",
    data: {"order[]": order}
  });
}
Timeline.create = function(query){
  var d = $.ajax({
    url: "/timeline/create",
    data: query ,
    type: "POST"
  }).fail(function(ajax){
    console.log("Timeline.create error: ", ajax.responseText);
  }).done(function(){
    View.Tabs.init();
  });
  View.TransStatus.add("creating timeline", d);
  return d;
}

Timeline.prototype.element = function(){
  return $('#timelines li[data-id="'+this.id+'"]');
}

Timeline.prototype.reloadStreams = function(){
  var self = this;
  return $.ajax({
    type: "GET",
    url: "/timelines/"+this.id+"/streams",
  }).done(function(json, type, d){
    self.streams = json;
  });
}

Timeline.prototype.url = function(type){
  switch(type){
    default:
    return "/timelines/"+this.id;
  }
}

Timeline.prototype.destroy = function(){
  var d = $.ajax({
    url: "/timelines/"+this.id,
    type: "DELETE"
  });
  View.TransStatus.add("deleting "+this.label, d);
  return d;
}

Timeline.prototype.detach = function(stream){
  var d = $.ajax({
    url: "/timelines/"+this.id+"/"+stream.id,
    type: "DELETE"
  });
  View.TransStatus.add("detaching "+stream.label + " from "+this.label, d);
  return d;
}

Timeline.prototype.attach = function(stream) {
  var d = $.ajax({
    type: "PUT",
    url: "/timelines/"+this.id+"/"+stream.id,
    complete: function(){
      View.Tabs.init();
    }
  });
  View.TransStatus.add("attaching "+stream.label + " to "+this.label, d);
  return d;
}
