# -- coding: utf-8

module CraftedBird
  class User
    attr_reader :client, :name

    def initialize(name, conf=nil)
      @name = name
      @conf = conf
      if @conf
        client = TwitterOAuth::Client.new(@conf)
      else
        client = TwitterOAuth::Client.new
      end
      @client = Client.new(client)
    end

    def method_missing(*args)
      @client.__send__(*args)
    end
  end
end
