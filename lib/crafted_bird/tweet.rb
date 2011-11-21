# -- coding: utf-8

module CraftedBird
  module Tweet
    def self.canocalize(tweet, user)
      tweet = Hashie::Mash.new(tweet)
      return tweet if tweet.context_user

      if !tweet["user"]
        tweet["user"] = {
          :screen_name => tweet["from_user"] # for search stream
        }
      end
      tweet["created_at"] = Time.parse(tweet["created_at"])
      tweet["text"].gsub!(/@([0-9a-zA-Z_-]+)/){
        %Q!<a class="twitter-user" href="//twitter.com/#{$~[1]}" data-name="#{$~[1]}">#{$~[0]}</a>!
      }
      tweet = canonical_entities(tweet)
      if tweet["retweeted_status"]
        tweet.retweeted_status = Tweet.canocalize(tweet.retweeted_status, user)
      end


      tweet.context_user = user
      tweet
    end

    def self.image_url(url)
      u = url["display_url"] || url["expanded_url"] || url["url"]
      if u["instagr.am"]
        "//"+u.gsub(/^https?/,"") + "media/?size=t"
      elsif u["twitpic.com"]
        id = u.match(%r![^/]+$!)[0]
        "//twitpic.com/show/thumb/#{id}"
      elsif u["yfrog.com"]
        "//#{u}:small"
      elsif u["lockerz.com"]
        "http://api.plixi.com/api/tpapi.svc/imagefromurl?url=#{Rack::Utils.escape("http://#{u}")}&size=small"
      end
    end

    def self.canonical_entities(tweet)
      if tweet["entities"]
        (tweet["entities"]["hashtags"] || []).each{|u|
          tweet["text"].gsub!("##{u["text"]}") do
            new = <<-HTML
            <a class="hashtag" href="https://twitter.com/#!/search?q=#{Rack::Utils.escape("##{u["text"]}")}" data-hashtag="#{Rack::Utils.escape_html(u["text"])}">##{Rack::Utils.escape_html(u["text"])}</a>
            HTML
            new.strip
          end
        }

        if tweet["entities"]["urls"]
          tweet["entities"]["urls"].each{|u|
            img = image_url(u)
            tweet["text"].gsub!(u["url"]) do
              "<a href=\"#{u["expanded_url"]}\">#{img ? "<img src=\"#{img}\" />" : u["expanded_url"]}</a>"
            end
          }
        end

        if tweet["entities"]["media"]
          tweet["entities"]["media"].each{|u|
            tweet["text"].gsub!(u["url"]) do
              "<a href=\"//#{u["display_url"]}\"><img src=\"#{image_url(u) || u["media_url"]}\" /></a>"
            end
          }
        end
      end
      tweet
    end
  end
end
