# -- coding: utf-8

Sequel::Model.plugin(:schema)

unless defined?(DB)
  Sequel.single_threaded = false
  DB = Sequel.sqlite("#{APP_ROOT}/log.db")
end

class Timeline < Sequel::Model
  set_schema do
    primary_key :id
    column :label, :varchar, :null => false, :unique => true
  end

  def validate
    super
    errors.add(:label, 'should be unique') if self.class[:label => label]
  end

  many_to_many :streams

  def maxid
    streams.map{|st|
      st.maxid || 0
    }.max
  end
end

class Stream < Sequel::Model
  set_schema do
    primary_key :id
    column :label, :varchar, :null => false, :unique => true
    column :last_updated, :timestamp
    column :max_id, :bigint
  end

  def validate
    super
    errors.add(:label, 'should be unique') if !self.id && self.class[:label => label]
  end

  many_to_many :timelines

  def add_tweets(*ids)
    DB[:streams_tweets].insert_multiple(ids) do |tw|
      {
        :stream_id => self.id,
        :tweet_id => tw[:id] || tw["id"] || tw.id,
      }
    end
  end

  def maxid
    # DMs are negative id
    (DB[:streams_tweets].filter(:stream_id => id).max("ABS(tweet_id)".lit) || 0)
  end

  def recent(limit=nil)
    ds = DB[:streams_tweets].filter(:stream_id => id).select(:tweet_id).order(:tweet_id.desc).limit(limit)
    Tweet.filter(
      :id => ds
    ).order(:id.desc)
  end
end

class Tweet < Sequel::Model
  # DirectMessages are stored as negative :id Tweet
  set_schema do
    column :id, :bigint, :unique => true, :primary_key => true
    column :msgpack, :bytea
  end
  unrestrict_primary_key

  def content
    MessagePack.unpack(self[:msgpack])
  end
end

unless DB.table_exists?(:streams)
  Stream.create_table!
end

unless DB.table_exists?(:tweets)
  Tweet.create_table!
end

unless DB.table_exists?(:timelines)
  Timeline.create_table!
end

unless DB.table_exists?(:streams_tweets)
  DB.create_table :streams_tweets do
    primary_key :id
    bigint :tweet_id
    integer :stream_id
    index [:stream_id, :tweet_id], :unique => true
  end
end

unless DB.table_exists?(:streams_timelines)
  DB.create_table :streams_timelines do
    primary_key :id
    foreign_key :stream_id,   :table => :streams
    foreign_key :timeline_id, :table => :timelines
    index [:stream_id, :timeline_id], :unique => true
  end
end

