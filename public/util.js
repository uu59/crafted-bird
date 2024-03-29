function compare_big_number_string(a,b){
  // a > b => 1
  // a < b => -1
  // a == b => 0
  var a = new String(a);
  var b = new String(b);
  if(a === b){
    return 0;
  }
  if(a.length != b.length){
    return (a.length > b.length ? 1 : -1);
  }
  for(var i=0; i<a.length; ++i){
    var aa = a.charAt(i);
    var bb = b.charAt(i);
    if(aa != bb){
      return (aa > bb ? 1 : -1);
    }
  }
  return 0;
}

function click_link(a){
  $(a).attr("rel", "noreferer");
  window.open(a.href);
}

function load_thread(src) {
  var src = $(src);
  var li = $(src).closest('*[data-id][data-context]');
  var reply = $('.reply-thread[data-id="'+src.attr("data-id")+'"]', li);
  if(reply.length > 0){
    reply.toggle();
    return ;
  }
  var content = $('<ol class="reply-thread" data-id="'+src.attr('data-id')+'">loading..</ol>');
  li.append(content);
  $.ajax({
    type: "GET",
    url: "/thread/"+li.attr("data-context")+"/"+src.attr("data-id"),
    complete: function(res){
      content.html(res.responseText);
      if(res.responseText.indexOf(' thread"') > -1){
        var aa = $('.thread', content);
        load_thread(aa[0]);
      }
    }
  });
}
