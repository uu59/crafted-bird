var Sound = (function(){
  var isDummy;
  var DEFAULT_VOL = 0.4;
  var volume = DEFAULT_VOL;

  var AudioCreate = (function(){
    var DummyAudio = function(path){
      this.load = function(){};
      this.play = function(){};
      this.volume = {};
    }
    if(typeof Audio === typeof void(0)){
      isDummy = true;
      return function(){
        return new DummyAudio(arguments[0]);
      }
    }else{
      isDummy = false;
      return function(){
        return new Audio(arguments[0]);
      }
    }
  })();

  var files = {
    "post": "/sounds/post.wav",
    "changeTweets": '/sounds/change_tweets.wav',
    "deletePost": '/sounds/delete.wav',
    "rt": '/sounds/rt.wav'
  };
  files.sample = files.post;
  $.each(files, function(k, f){
    files[k] = AudioCreate(f);
    files[k].volume = DEFAULT_VOL;
    files[k].load();
  });

  return {
    play: function(key){
      if(volume > 0){
        files[key].volume = volume;
        files[key].play();
      }
    },

    changeVolume: function(vol){
      volume = vol;
    },

    isDummy: isDummy,
    DEFAULT_VOL: DEFAULT_VOL
  };
})();
