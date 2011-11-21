# -- coding: utf-8

get "/streams" do
  content_type :json
  CraftedBird.streams.map{|st|
    {
      :id => st.id,
      :label => st.label,
      :max_id => st.model.maxid.to_s,
    }
  }.sort_by{|st| st[:label]}.to_json
end

get "/streams/:id" do
  st = CraftedBird.streams.find{|st| st.id.to_s == params[:id].to_s}
  halt(404) unless st
  if params[:dry]
    puts "dry fetch"
    if st.fetch_from_api(:since_id => params[:max_id])
      halt(204)
    else
      halt(304)
    end
  end
  @timeline = st.fetch(:force => params[:force] == "true")
  @streams = [st]
  headers(
    "X-Max-Id" => @timeline.map(&:id).max.to_s,
    "X-New-Tweets-Count" => @timeline.find_all{|tw| tw.id > params[:max_id].to_i}.length.to_s,
  )
  erb :timeline, :layout => false
end

delete "/streams/:id" do
  stream = ::Stream[params[:id]]
  stream.destroy if stream
  halt(204)
end

post "/stream/create" do
  label = [params[:screen_name], params[:method], (params[:args]||{}).to_json].join("-")
  st = ::Stream.new(:label => label)
  halt(400, st.errors.full_messages.to_json) unless st.valid?
  st.save
  st[:id].to_s
end


