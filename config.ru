require "./app.rb"
use Rack::StaticCache, :urls => ["/images", "/sounds"], :root => "public"
run Sinatra::Application
