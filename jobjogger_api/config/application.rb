require_relative "boot"

require "rails/all"
require "jwt"

Bundler.require(*Rails.groups)

module JobjoggerApi
  class Application < Rails::Application
    config.load_defaults 8.1

    config.autoload_lib(ignore: %w[assets tasks])

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    config.middleware.use Rack::Attack
    config.api_only = true

    # X-Frame-Options is clickjacking protection for HTML pages — not relevant for an API.
    # Removing it allows Active Storage blob URLs to be embedded in iframes on the frontend.
    config.action_dispatch.default_headers.delete('X-Frame-Options')
  end
end
