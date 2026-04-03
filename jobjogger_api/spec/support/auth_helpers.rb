# frozen_string_literal: true

module AuthHelpers
  # Sets a signed JWT cookie for the given user and returns JSON content-type headers.
  # The cookie is set as a side-effect; the returned hash is used as request headers.
  def auth_headers_for(user)
    set_auth_cookie(generate_jwt_for(user))
    { "Content-Type" => "application/json" }
  end

  def generate_jwt_for(user)
    payload = {
      sub: user.id,
      exp: 24.hours.from_now.to_i,
      iat: Time.current.to_i
    }
    JWT.encode(payload, jwt_secret, "HS256")
  end

  def expired_jwt_for(user)
    payload = {
      sub: user.id,
      iat: 2.hours.ago.to_i,
      exp: 1.hour.ago.to_i
    }
    JWT.encode(payload, jwt_secret, "HS256")
  end

  # Sets the jwt signed cookie directly with the given raw token string.
  # Rack::Test::CookieJar doesn't support .signed, so we compute the signed
  # value via ActionDispatch and set the raw cookie string directly.
  def set_auth_cookie(token)
    cookies[:jwt] = ad_cookie_jar.tap { |j|
      j.signed[:jwt] = { value: token, httponly: true, expires: 1.day.from_now }
    }[:jwt]
  end

  # Reads and verifies the signed :jwt cookie set by the last response.
  # Returns the raw JWT string, or nil if no valid cookie is present.
  def decode_jwt_cookie
    raw = cookies[:jwt]
    return nil if raw.blank?

    ad_cookie_jar(http_cookie: "jwt=#{raw}").signed[:jwt]
  end

  # Decodes the signed :jwt cookie and returns the payload hash.
  def decode_jwt_payload
    token = decode_jwt_cookie
    return nil if token.nil?

    JWT.decode(token, jwt_secret, true, { algorithm: "HS256" }).first
  end

  def json_response
    JSON.parse(response.body)
  end

  private

  def jwt_secret
    Rails.application.credentials.devise_jwt_secret_key ||
      ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
  end

  def ad_cookie_jar(http_cookie: nil)
    env = Rails.application.env_config.merge(
      "rack.input"     => StringIO.new,
      "REQUEST_METHOD" => "GET",
      "PATH_INFO"      => "/",
      "HTTP_HOST"      => "localhost"
    )
    env["HTTP_COOKIE"] = http_cookie if http_cookie
    ActionDispatch::Request.new(env).cookie_jar
  end
end
