# -- coding: utf-8

require "rubygems"

module CraftedBird
  class Timeline
    attr_reader :label, :model

    def initialize(label)
      @label = label
      @model = ::Timeline.find_or_create(:label => @label) do |tl|
        tl.label = @label
      end
      CraftedBird.timelines << self
    end

    def id
      @model.id
    end

    def streams
      streams = @model.streams.map{|st| st[:id]}
      CraftedBird.streams.find_all{|st|
        streams.include?(st.id)
      }
    end

    def fetch(force = false)
      streams.map{|st|
        st.fetch(force)
      }.flatten.
        sort_by{|tw| tw.created_at}.reverse.uniq.take(300)
    end
  end
end
