var Event = {
  debug: false,

  _debug: function(){
    if(Event.debug){
      console.log.apply(console, arguments);
    }
  },

  trap: function(type, func) {
    Event._debug(type, "trap registered");
    window.addEventListener(type, function(ev){
      Event._debug(type, "trapped", ev);
      func.call(null, ev);
    }, false);
  },

  fire: function(type, data){
    var ev = document.createEvent('Event');
    ev.initEvent(type, true, true);
    ev["data"] = data;
    Event._debug(type, "fired");
    document.dispatchEvent(ev);
  }
}
