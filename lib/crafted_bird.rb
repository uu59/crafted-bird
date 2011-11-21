# -- coding: utf-8

module CraftedBird
  attr_accessor :streams, :timelines
  attr_reader :mutex
  TIMELINES_ORDER_FILE = "#{APP_ROOT}/conf/timelines_order.json"

  @streams = []
  @timelines = []
  @users = {}

  def register_user(user)
    @users[user.name] = user
  end

  def client(key)
    @users[key].client if @users[key]
  end

  def load_streams
    @streams = []
    ::Stream.each{|st|
      CraftedBird::Stream.new(st)
    }
  end

  def load_timelines
    @timelines = []
    ::Timeline.each{|tl|
      CraftedBird::Timeline.new(tl[:label])
    }
  end

  def timelines_order
    begin
      JSON.parse File.read(TIMELINES_ORDER_FILE)
    rescue
      []
    end
  end

  extend self
end
