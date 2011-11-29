# -- coding: utf-8

module CraftedBird
  class Client
    def initialize(client)
      @client = client
    end

    def status(id)
      @client.__send__(:get, "/statuses/show.json?id=#{id}&include_entities=true")
    end

    def user_timeline(*args)
      args = normalize(*args)
      args.merge!(:include_entities => true, :include_rts => true, :trim_user => false)
      args.count = 200 unless args.count
      super(args)
    end

    def home_timeline(arg={})
      arg.merge!(:include_entities => true, :include_rts => true, :trim_user => false, :count => 200)
      super(arg)
    end

    def retweeted_by_user(arg={})
      arg.merge!(:include_entities => true, :include_rts => true, :trim_user => false, :count => 200)
      @client.__send__(:get, "/statuses/retweeted_by_user.json?screen_name=#{arg["id"]}&include_entities=true")
    end

    def search(*args)
      args = normalize(*args)
      args.merge!(:result_type => "recent", :include_entities => true, :rpp => 100)
      q = args.delete(:q)
      res = super(q, args)
      entities = Rack::Utils::ESCAPE_HTML.map{|k,v| {v => k}}.inject({}){|r, v| r.merge(v)}
      re = entities.keys.map{|v| Regexp.escape(v)}.join("|")
      res["results"].map{|tw|
        tw["source"] = tw["source"].gsub(/(#{re})/){|key|
          entities[key]
        }
        tw
      }
    end

    def favorites(*args)
      args = normalize(*args)
      id = args.delete(:id)
      @client.__send__(:get, "/favorites.json?count=200&id=#{id}&include_entities=true")
    end

    def userinfo(*args)
      args = normalize(*args)
      @client.__send__(:get, "/users/show.json?#{Rack::Utils.build_query(args)}")
    end

    def dm(*args)
      msgs = Parallel.map(["/direct_messages/sent.json?count=200", "/direct_messages.json?count=200"], :in_processes => 2){|path|
        @client.__send__(:get, path)
      }
      msgs.flatten.map{|m|
        m["id"] = m["id"].to_i * -1
        m = Hashie::Mash.new(m)
        if m.error
          return nil
        end
        m.stream_type = "dm"
        m
      }.compact.sort_by{|m| m.id.to_i}.reverse
    end

    def method_missing(*args)
      @client.__send__(*args)
    end

    private
    def normalize(*args)
      args = args.inject({}){|r, t| r.merge(t)}
      Hashie::Mash.new(args)
    end
  end
end
