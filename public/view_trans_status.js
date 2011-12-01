View.TransStatus = (function(){
  var counter = 0;
  var queue;

  $(function(){
    queue = $('<ol></ol>').appendTo('#trans-status');
  });

  return {
    add: function(text, defer){
      var child = $('<li style="cursor:pointer" data-counter="'+(++counter)+'">'+text+'</li>');
      queue.append(child);
      var self = this;
      if(defer){
        child.click(function(){
          (defer.abort || defer.reject)();
        });
        defer.fail(function(){
          child.addClass('failed');
        }).always(function(){
          self.remove(child);
        });
      }
      return (function(id){
        return function(){
          self.remove(child);
        }
      })(counter);
    },

    remove: function(child){
      if(!child){
        return ;
      }
      return child.animate({
        opacity: 0.1
      }, {duration: 1200}).promise().always(function(){
        child.remove();
      });
    }
  }
})();
