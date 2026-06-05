require_relative "boot"

require "rails/all"
require "jwt"

Bundler.require(*Rails.groups)

module JobjoggerApi
  class Application < Rails::Application
    config.load_defaults 8.1
    config.time_zone = "Sydney"

    config.autoload_lib(ignore: %w[assets tasks])

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    config.middleware.use Rack::Attack
    config.api_only = true
  end
end
