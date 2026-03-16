# frozen_string_literal: true

module AuthHelpers
  # Generates a valid Bearer token for the given user and sets it as the
  # Authorization header on subsequent requests.
  def auth_headers_for(user)
    token = generate_jwt_for(user)
    { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }
  end

  # Returns a raw JWT string for the given user without setting headers.
  def generate_jwt_for(user)
    jti = SecureRandom.uuid
    payload = {
      sub: user.id.to_s,
      jti: jti,
      scp: "user",
      aud: nil,
      iat: Time.current.to_i,
      exp: 24.hours.from_now.to_i
    }
    secret = Rails.application.credentials.devise_jwt_secret_key || ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
    JWT.encode(payload, secret, "HS256")
  end

  # Generates a JWT that is already expired (for testing token expiry).
  def expired_jwt_for(user)
    jti = SecureRandom.uuid
    payload = {
      sub: user.id.to_s,
      jti: jti,
      scp: "user",
      aud: nil,
      iat: 2.hours.ago.to_i,
      exp: 1.hour.ago.to_i
    }
    secret = Rails.application.credentials.devise_jwt_secret_key || ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
    JWT.encode(payload, secret, "HS256")
  end

  # Generates a JWT signed with a wrong secret (for testing invalid token rejection).
  def invalid_jwt_for(user)
    payload = {
      sub: user.id.to_s,
      jti: SecureRandom.uuid,
      exp: 24.hours.from_now.to_i
    }
    JWT.encode(payload, "wrong_secret", "HS256")
  end

  # Adds the given token's jti to the JwtDenylist, simulating a signed-out token.
  def revoke_token(token)
    secret = Rails.application.credentials.devise_jwt_secret_key || ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
    payload = JWT.decode(token, secret, true, { algorithm: "HS256" }).first
    JwtDenylist.create!(jti: payload["jti"], exp: Time.at(payload["exp"]))
  end

  def json_response
    JSON.parse(response.body)
  end
end
