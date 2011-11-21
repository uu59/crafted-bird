#!/usr/bin/env ruby
# -- coding: utf-8

require "#{File.dirname(__FILE__)}/../init.rb"

consumer = OAuth::Consumer.new(
  TW_CONSUMER_TOKEN,
  TW_CONSUMER_SECRET,
  :site => "https://api.twitter.com",
)
req = consumer.get_request_token
puts "Open and authorize this app"
puts req.authorize_url
print "Enter PIN: "
pin = STDIN.gets.strip
acc = req.get_access_token(:oauth_verifier => pin)

name = acc.params[:screen_name]

tokens = YAML.load(File.read(USERS_YAML_PATH)) || {}

tokens[name] = {
  :consumer_key => TW_CONSUMER_TOKEN,
  :consumer_secret => TW_CONSUMER_SECRET,
  :token => acc.token,
  :secret => acc.secret,
}

File.open(USERS_YAML_PATH, "w"){|f|
  f.puts tokens.to_yaml
}

puts "#{name}'s configurations are saved!"
