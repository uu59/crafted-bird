// Garbage Collect for Deferred object
// bacause Deferred objects are still in memory forever

var GC = {
  deferreds: [],
  run: function(){
    GC.deferreds.forEach(function(d, i){
      if(d && d.state() != "pending"){
        GC.deferreds[i] = null;
      }
    });
    var before = GC.deferreds.length;
    GC.deferreds = GC.deferreds.filter(function(d){
      return d !== null;
    });
    var after = GC.deferreds.length;
  }
}

$.Deferred = (function(){
  var orig = $.Deferred;
  return function(){
    var o = orig.apply(this, Array.prototype.slice.call(arguments));
    GC.deferreds.push(o);
    return o;
  }
  return orig;
})();

window.setInterval(function(){
  GC.run();
}, 30 * 1000);
