var Data = (function(){
  return {
    get: function(key){
      var data = localStorage[key];
      return data ? JSON.parse(data) : null;
    },
    set: function(key, value){
      return localStorage[key] = JSON.stringify(value);
    },
    remove: function(key){
      return delete localStorage[key];
    }
  }
})();
