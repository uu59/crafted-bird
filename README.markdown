A browser-based Twitter client

## Inspired by

* [Tween](http://sourceforge.jp/projects/tween/wiki/FrontPage)
* [Tabtter](http://tabtter.jp/)
* [TweetDeck for iPhone](http://www.tweetdeck.com/iphone/)


## QuickStart:

Note: SQLite3 required

    $ git clone https://github.com/uu59/crafted-bird
    $ cd crafted-bird
    $ gem install bundler
    $ bundle install

At first, register your Twitter account by your browser.

    $ ./bin/authenticate
    Open and authorize this app
    https://api.twitter.com/oauth/authorize?oauth_token=FHkQGyJON03Axey5P53gbYOVD3cIK0DpnebtCKK2A
    Enter PIN: (Paste PIN here and Enter)
    uu59's configurations are saved!
    $ bundle exec thin -R config.ru -p 9090 start

then open http://localhost:9090/


## Screenshots:

Reply

![reply](http://i.imgur.com/2rAtCl.png)

Reloading

![reloading](http://i.imgur.com/DuI8Ql.png)

Create Stream

![create stream](http://i.imgur.com/CtcOpl.png)

Attach Stream to Timeline

![attach Stream to Timeline](http://i.imgur.com/jZfJvl.png)

Timeline setting

![Timeline setting](http://i.imgur.com/luK6fl.png)


## Icons:

* [http://www.freeiconsweb.com/Free-Downloads.asp?id=1301](http://www.freeiconsweb.com/Free-Downloads.asp?id=1301)
* [http://www.freeiconsweb.com/Free-Downloads.asp?id=1468](http://www.freeiconsweb.com/Free-Downloads.asp?id=1468)
* [http://www.iconfinder.com/icondetails/49853/128/3_media_volume_icon](http://www.iconfinder.com/icondetails/49853/128/3_media_volume_icon)
* [http://www.iconfinder.com/icondetails/49850/128/0_media_volume_icon](http://www.iconfinder.com/icondetails/49850/128/0_media_volume_icon)

## Sounds: 

* [http://www.tam-music.com/se.html](http://www.tam-music.com/se.html)
