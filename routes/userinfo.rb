# -- coding: utf-8

get "/userinfo/:context/:userid" do
  c = CraftedBird.client(params[:context].to_sym)
  @context = params[:context]
  @screen_name = params[:userid]
  erb :userinfo, :layout => false
end

get "/userinfo/:context/:userid/info" do
  c = CraftedBird.client(params[:context].to_sym)
  @info = c.userinfo(:screen_name => params[:userid])
  @info = Hashie::Mash.new(@info)
  erb :_userinfo_info, :layout => false
end

get "/userinfo/:context/:userid/stream" do
  c = CraftedBird.client(params[:context].to_sym)
  @tw = c.user_timeline(:screen_name => params[:userid], :count => 30)
  ret = ""
  @tw.each{|tw|
    tw = CraftedBird::Tweet.canocalize(tw, params[:context].to_sym);
    ret << partial(:_stream, :tw => tw)
  }
  ret
end
