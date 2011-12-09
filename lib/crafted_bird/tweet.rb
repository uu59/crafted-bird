# -- coding: utf-8

module CraftedBird
  module Tweet
    def self.canocalize(tweet, user)
      tweet = Hashie::Mash.new(tweet)
      return tweet if tweet.error

      if tweet.user.nil?
        # for search stream
        tweet["user"] = {
          :screen_name => tweet.from_user,
          :profile_image_url => tweet.profile_image_url,
          :protected_user => false,
        }
      end
      tweet["created_at"] = Time.parse(tweet["created_at"]) if tweet.created_at
      tweet["text"].gsub!(/@([0-9a-zA-Z_-]+)/){
        %Q!<a class="twitter-user" href="//twitter.com/#{$~[1]}" data-name="#{$~[1]}">#{$~[0]}</a>!
      }
      tweet = canonical_entities(tweet)
      if tweet["retweeted_status"]
        tweet.retweeted_status = Tweet.canocalize(tweet.retweeted_status, user)
      end


      tweet.context_user = user
      tweet = Tweet.prune(tweet)
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

    def self.prune(tweet)
      pruned = Hashie::Mash.new({:user => {}})
      %w!id in_reply_to_status_id in_reply_to_screen_name created_at context_user retweeted_status source text entities!.each do |p|
        pruned[p] = tweet[p]
      end
      %w!profile_image_url protected_user screen_name!.each do |up|
        pruned.user[up] = tweet.user[up]
      end
      pruned
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
              # display_url will be deeplink when it's a p.twimg.com image because pic.twitter.com required JavaScript
              display_url = u["display_url"].match(/pic\.twitter\.com/) ? u["media_url"] : "//" + u["display_url"]
              %Q!<a href="#{display_url}"><img src="#{image_url(u) || u.media_url_https || u.media_url}" /></a>!
            end
          }
        end
      end
      tweet
    end
  end
end
