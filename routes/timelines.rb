# -- coding: utf-8

get "/timelines" do
  content_type :json

  tls = CraftedBird.timelines
  if tls.empty?
    return "{}"
  end
  tls = tls.map{|tl|
    {
      :id => tl.id,
      :label => tl.label,
      :streams => tl.streams.map{|st|
        {
          :id => st.model.id,
          :label => st.model.label,
        }
      }
    }
  }
  if File.exists?(CraftedBird::TIMELINES_ORDER_FILE)
    order = CraftedBird.timelines_order
    tls = tls.sort_by{|tl| order.index(tl[:id].to_i) || 999}
  end
  tls.to_json
end

get "/timelines/:id/unread/:from_id" do
  halt(400) if params[:from_id].to_i == 0 && params[:from_id] != "0"
  tl = ::Timeline[:id => params[:id]]
  halt(404) unless tl
  stids = tl.streams.map{|st|st[:id]}
  halt(200, 0) if stids.length == 0
  unread = DB[:streams_tweets].filter(:stream_id => stids).filter("ABS(tweet_id) > ?", params[:from_id].to_i.abs).count || 0
  unread.to_s
end

put "/timelines/order" do
  order = params[:order].map{|tlid| tlid.to_i}
  File.open(CraftedBird::TIMELINES_ORDER_FILE, "w"){|f|
    f.print order.to_json
  }
  halt(204)
end

get "/timelines/:id/setting" do
  @tl = CraftedBird.timelines.find{|tl| tl.id.to_s == params[:id]}
  erb :_timeline_edit, :layout => false
end

delete "/timelines/:id/:stream_id" do
  tl = ::Timeline[params[:id]]
  st = ::Stream[params[:stream_id]]
  if !tl ||!st
    halt(404)
  end

  if tl.streams.include?(st)
    tl.remove_stream(st)
  end
  halt(204)
end

put "/timelines/:id/:stream_id" do
  tl = ::Timeline[params[:id]]
  st = ::Stream[params[:stream_id]]
  if !tl ||!st
    halt(404)
  end

  unless tl.streams.include?(st)
    tl.add_stream(st)
  end
  halt(204)
end

put "/timelines/:id" do
  tl = ::Timeline[:id => params[:id]]
  halt(404) unless tl
  if tl.update(params[:timeline])
    halt(204)
  end
  halt(400, "error")
end

delete "/timelines/:id" do
  tl = ::Timeline[:id => params[:id]]
  tl.streams.each{|st|
    begin
      tl.remove_stream(st)
    end
  }
  tl.destroy
  halt(204)
end

post "/timeline/create" do
  label = params[:label]
  halt(400) if label.length == 0
  tl = ::Timeline.new(:label => label)
  halt(400, tl.errors.full_messages.to_json) unless tl.valid?
  tl.save
  halt(200, tl[:id].to_s)
end

get "/timelines/:id" do
  tl = CraftedBird.timelines.find{|tl| tl.id.to_s == params[:id]}
  unless tl
    halt(404)
  end
  @streams = tl.streams
  @timeline = tl.fetch(:force => (params[:force] == "true"))
  @label = tl.label
  headers(
    "X-Max-Id" => @timeline.map(&:id).max.to_s
  )
  erb :timeline, :layout => false
end


