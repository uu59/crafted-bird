# -- coding: utf-8

require "rubygems"

module CraftedBird
  class Stream
    attr_reader :id, :label, :model, :context

    #def initialize(client_key=:blank, method=:home_timeline, args='')
    def initialize(model)
      @model = model
      client_key, method, args = @model[:label].split('-', 3)
      @args = begin
        JSON.parse(args)
      rescue
        args = {}
      end
      @context = client_key.to_sym
      @client = CraftedBird.client(@context)
      @method = method.to_sym
      @label = "#{client_key}-#{method}-#{@args.to_json}"
      @id = @model.pk
      CraftedBird.streams << self
    end

    def fetch_from_api(args={})
      tweets = @client.__send__(@method, @args.merge({
        :min_id => @model[:max_id] || 1,
        :since_id => @model[:max_id] || 1,
      }).merge(args))
      return false if tweets.length == 0
      has_new = false

      tweets.each do |tweet|
        begin
          @model.add_tweets ::Tweet.find(:id => tweet["id"]) || begin
            tw = Tweet.canocalize(tweet, @context)
            tw.created_at = tw.created_at.to_s
            if tw.retweeted_status
              tw.retweeted_status.created_at = tw.retweeted_status.created_at.to_s
            end
            ::Tweet.create(:id => tweet["id"], :msgpack => tw.to_hash.to_msgpack)
          end
          has_new = true
        rescue => ex
          # Maybe duplicate error
        end
      end

      begin
        @model[:last_updated] = Time.now
        @model[:max_id] = tweets.map{|tw| tw["id"].to_i}.max
      rescue => e
        p tweets
        raise e
      ensure
        @model.save
      end
      has_new
    end

    def fetch(opt={})
      last_updated = @model[:last_updated]
      if opt[:force] || last_updated.nil?
        begin
          fetch_from_api
        end
      end

      tweets = @model.recent(300).map{|tw|
        CraftedBird::Tweet.canocalize(tw.content, @context)
      }
      if @method != :favorites
        tweets.sort_by{|tw| tw.created_at}.reverse
      else
        tweets
      end
    end
  end
end
