# frozen_string_literal: true

module AuthHelpers
  # Sets a signed JWT cookie for the given user and returns JSON content-type headers.
  # Used as a drop-in for the old header-based approach:
  #   let(:headers) { auth_headers_for(user) }
  # The cookie is set as a side-effect when the let is first evaluated.
  def auth_headers_for(user)
    token = generate_jwt_for(user)
    set_auth_cookie(token)
    { "Content-Type" => "application/json" }
  end

  # Returns a raw JWT string for the given user.
  def generate_jwt_for(user)
    payload = {
      sub: user.id,
      exp: 24.hours.from_now.to_i,
      iat: Time.now.to_i
    }
    secret = Rails.application.credentials.devise_jwt_secret_key ||
             ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
    JWT.encode(payload, secret, "HS256")
  end

  # Returns an already-expired JWT for testing token expiry.
  def expired_jwt_for(user)
    payload = {
      sub: user.id,
      iat: 2.hours.ago.to_i,
      exp: 1.hour.ago.to_i
    }
    secret = Rails.application.credentials.devise_jwt_secret_key ||
             ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
    JWT.encode(payload, secret, "HS256")
  end

  # Sets the jwt signed cookie directly with the given raw token string.
  # Rack::Test::CookieJar doesn't support .signed, so we compute the signed
  # value via ActionDispatch and set the raw cookie string directly.
  def set_auth_cookie(token)
    cookies[:jwt] = ad_cookie_jar.tap { |j|
      j.signed[:jwt] = { value: token, httponly: true, expires: 1.day.from_now }
    }[:jwt]
  end

  # Reads and verifies the signed :jwt cookie that was set by the last response.
  # Returns the raw JWT string, or nil if no valid cookie is present.
  def decode_jwt_cookie
    raw = cookies[:jwt]
    return nil if raw.blank?

    env = Rails.application.env_config.merge(
      "rack.input"     => StringIO.new,
      "REQUEST_METHOD" => "GET",
      "PATH_INFO"      => "/",
      "HTTP_HOST"      => "localhost",
      "HTTP_COOKIE"    => "jwt=#{raw}"
    )
    ActionDispatch::Request.new(env).cookie_jar.signed[:jwt]
  end

  def json_response
    JSON.parse(response.body)
  end

  private

  def ad_cookie_jar
    env = Rails.application.env_config.merge(
      "rack.input"     => StringIO.new,
      "REQUEST_METHOD" => "GET",
      "PATH_INFO"      => "/",
      "HTTP_HOST"      => "localhost"
    )
    ActionDispatch::Request.new(env).cookie_jar
  end
end
