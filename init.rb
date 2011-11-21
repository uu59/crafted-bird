# -- coding: utf-8

require "pp"
require "logger"
require "time"
require "digest/md5"
require "yaml"
require "rubygems"
require "bundler"
Bundler.setup
Bundler.require

APP_ROOT = Sinatra::Application.root || File.dirname(__FILE__)

Dir.glob("#{APP_ROOT}/lib/**/*.rb"){|f| require f}

TW_CONSUMER_TOKEN = "4i22HgTk0KSTkUKz73y5Tg"
TW_CONSUMER_SECRET = "sIgmPx6aLqh5oZ1693SfuSY2tny5wrCbQePvPqWsw"
USERS_YAML_PATH = "#{APP_ROOT}/conf/tokens.yml"

unless File.directory?(File.dirname(USERS_YAML_PATH))
  Dir.mkdir(File.dirname(USERS_YAML_PATH))
end

unless File.exists?(USERS_YAML_PATH)
  File.open(USERS_YAML_PATH, "w").close
end

users = YAML.load(File.read(USERS_YAML_PATH))
if users
  KNOWN_USERS = users.map{|name, conf|
    CraftedBird::User.new(name.to_sym, conf)
  }
  KNOWN_USERS.each{|u|
    CraftedBird.register_user(u)
  }
end
CraftedBird.register_user(CraftedBird::User.new(:blank))

