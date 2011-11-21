# -- coding: utf-8

require "#{File.dirname(__FILE__)}/init.rb"

before do
  CraftedBird.load_streams
  CraftedBird.load_timelines
end

helpers do
  def partial(tpl, locals={})
    erb tpl, {:layout => false}, locals
  end

  def protected_user(p)
    %Q!<img class="private" src="/images/padlock.png" width="12" height="12" />! if p
  end

  def nl2br(text)
    text.gsub(/(\r\n|\r|\n)/, "<br />")
  end
end

Dir.glob("#{APP_ROOT}/routes/*.rb"){|f| require f}

get '/' do
  @timeline = CraftedBird.timelines.first
  @timelines = CraftedBird.timelines
  @users = KNOWN_USERS.map{|u| u.name}
  erb :index
end

get "/userinfo/:user/:userid" do
  c = CraftedBird.client(params[:user].to_sym)
  @tweets = c.user_timeline(:screen_name => params[:userid], :count => 30)
  @info = c.userinfo(:screen_name => params[:userid])
  @tweets.map!{|tw|
    CraftedBird::Tweet.canocalize(tw, params[:user].to_sym);
  }
  @context = params[:user]
  @info = Hashie::Mash.new(@info)
  erb :userinfo, :layout => false
end

get "/users" do
  KNOWN_USERS.map{|u| u.name}.to_json
end

get "/users/limits" do
  content_type :json
  if params[:user]
    {
      params[:user] => CraftedBird.client(params[:user].to_sym).rate_limit_status
    }.to_json
  else
    Parallel.map(KNOWN_USERS, :in_processes => 4){|u|
      {
        u.name => CraftedBird.client(u.name).rate_limit_status
      }
    }.inject({}){|r,u| r.merge(u)}.to_json
  end
end

get "/thread/:user/:id" do
  @user = params[:user].to_sym
  tw = Tweet.find(:id => params[:id])
  if tw
    halt(200, partial(:_stream, :tw => CraftedBird::Tweet.canocalize(tw.content, @user)))
  end

  c = CraftedBird.client(@user)
  @tweet = c.status(params[:id])
  if @tweet["error"].nil?
    Tweet.create({
      :id => params[:id],
      :msgpack => @tweet.to_msgpack,
    })
    partial(:_stream, :tw => CraftedBird::Tweet.canocalize(@tweet, @user))
  else
    content_type :json
    halt(400, @tweet.to_json)
  end
end

delete "/post/:user/:id" do
  c = CraftedBird.client(params[:user].to_sym)
  s = if params[:id].to_i < 0
    c.message_destroy(params[:id].to_i.abs)
  else
    c.status_destroy(params[:id])
  end
  if s
    ::Tweet[:id => params[:id]].destroy
    halt(204)
  else
    halt(400)
  end
  s
end

post "/post/:user/retweet" do
  c = CraftedBird.client(params[:user].to_sym)
  puts :retweet
  content_type :json
  s = c.retweet(params[:id])
  if s && s["errors"].nil?
    halt(200, s.to_json)
  else
    halt(400, s.to_json)
  end
end

post "/post/:user/tweet" do
  c = CraftedBird.client(params[:user].to_sym)
  res = c.update(params[:tweet], :in_reply_to_status_id => params[:reply_to])
  if res["error"].nil?
    halt(204)
  else
    content_type :json
    halt(400, res.to_json)
  end
end

