View.Post = (function(){
  function selectedUsers() {
    return $('#post img.selected').map(function(i, img){
      return $(img).attr('data-user');
    });
  }
  var form;
  $(function(){
    form = $('#postform #input-form');
  });

  var ViewPost = {
    reset: function(){
      $("#known_users img").each(function(i, img){
        $(img).removeClass("selected");
      });
      $('#post textarea').val("");
      $('#length').text("0 / 140");
      ViewPost.resetInReplyTo();
    },

    resetInReplyTo: function(){
      $('input[name="in_reply_to"]').val("");
      $('#post #reply-area').html("");
    },
    
    selectSingleUser: function(user){
      $('#known_users img').each(function(i, img){
        $(img).removeClass("selected");
      });
      $('#known_users img[data-user="'+user+'"]').toggleClass('selected');
    },

    update: function(tx){
      // do submit
      var users = selectedUsers();
      if(users.length == 0){
        alert("postuser does not set");
        return ;
      }
      tx.disabled = true;
      Sound.play('post');
      $.each(users, function(i, user){
        var d = $.ajax({
          type: "POST",
          url: "/post/"+user+"/tweet",
          cache: false,
          data: {
            "tweet": tx.value,
            "reply_to": $('input[name="in_reply_to"]').val()
          }
        }).done(function(){
          tx.value = "";
          tx.disabled = false;
          $('#length').text("0 / 140");
          ViewPost.resetInReplyTo();
          Event.fire('post.after', user);
        }).fail(function(res){
          alert("error\n" + res.responseText);
          tx.disabled = false;
        });
        View.TransStatus.add('tweet posting('+user+')', d);
      });
    },

    close: function(){
      if(form.is(":hidden")){
        return ;
      }
      var effect = {duration: 16};
      var h = form.height();
      var ph = $("#postform").height();
      form.hide();
      View.adjustHeight();
    },

    open: function(){
      if(form.is(":visible")){
        return ;
      }
      var ph = $("#postform").height();
      form.show();
      View.adjustHeight();
    },

    toggle: function(){
      if(form.is(':hidden')){
        ViewPost.open();
      }else{
        ViewPost.close();
      }
    }
  }

  Event.trap('post.after', function(ev){
    var user = ev.data;
    setTimeout(function(){
      $.each(View.Tabs.Streams.getModels(), function(i, model){
        if(model.label.indexOf(user+'-home_timeline') > -1){
          model.dry_load().done(function(){
            if(View.Tweets.getCurrent() == model){
              model.activate();
            }
          });
        }
      });
    }, 3000);
  });

  Event.trap('post.userimg.click', function(ev){
    $(ev.data).toggleClass('selected');
  });

  Event.trap('post.rt.click', function(ev){
    var users = selectedUsers();
    if(users.length == 0){
      alert("user doesn't selected");
      return ;
    }
    var id = ev.data.attr('data-id');
    Sound.play("rt");
    $.each(users, function(i, user){
      var d = $.ajax({
        type: "POST",
        url: "/post/"+user+"/retweet",
        data: {id: id},
      }).done(function(){
        Event.fire('post.after', user);
      });
      View.TransStatus.add('retweeting('+user+')', d);
    });
  });

  Event.trap('post.delete.click', function(ev){
    if(!confirm('really delete this?')){
      return ;
    }
    var li = ev.data.closest('li[data-id]');
    var id = li.attr('data-id');
    var user = li.attr('data-context');
    Sound.play("deletePost");
    var d = $.ajax({
      type: "DELETE",
      url: "/post/"+user+"/"+id
    });
    View.TransStatus.add('delete tweeet', d);
    return d;
  });

  Event.trap('post.reply-dm.click', function(ev){
    ViewPost.reset();
    var self = ev.data;
    $('#post img[data-user="'+self.attr('data-user')+'"]').trigger('click');
    $('#post textarea').val("d "+self.attr('data-name')+" ");
    ViewPost.selectSingleUser(self.closest('li[data-context]').attr('data-context'));
    ViewPost.open();
    var tx = $('#post textarea')[0];
    var posEnd = tx.value.length;
    tx.focus();
    tx.setSelectionRange(posEnd, posEnd);
  });

  Event.trap('post.reply.click', function(ev){
    var id = ev.data.attr('data-id');
    $('#post textarea').val("@"+ev.data.attr("data-name") + " ");
    $('input[name="in_reply_to"]').val(id);
    var to = [
      "@"+$('#tweets li[data-id="'+id+'"] p.appendix span:last-child').attr("data-name"),
      $('#tweets li[data-id="'+id+'"] p.tweet').text(),
    ].join(": ");
    $('#post #reply-area').html(to);
    ViewPost.selectSingleUser($(ev.data).closest('*[data-context]').attr('data-context'));
    ViewPost.open();
    var tx = $('#post textarea')[0];
    var posEnd = tx.value.length;
    tx.focus();
    tx.setSelectionRange(posEnd, posEnd);
  });

  return ViewPost;
})();

