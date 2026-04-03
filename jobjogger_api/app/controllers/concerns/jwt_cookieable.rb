# frozen_string_literal: true

module JwtCookieable
  extend ActiveSupport::Concern

  private

  def generate_jwt(user)
    expiry = jwt_cookie_expiry
    payload = {
      sub: user.id,
      exp: expiry.to_i,
      iat: Time.current.to_i
    }

    JWT.encode(payload, jwt_secret, "HS256")
  end

  def set_jwt_cookie(token)
    production = Rails.env.production?
    cookies.signed[:jwt] = {
      value: token,
      httponly: true,
      secure: production,
      same_site: production ? :none : :lax,
      domain: cookie_domain,
      expires: jwt_cookie_expiry
    }
  end

  def delete_jwt_cookie
    cookies.delete(:jwt, domain: cookie_domain)
  end

  def cookie_domain
    Rails.env.production? ? ".jobjogger.com" : "localhost"
  end

  def jwt_cookie_expiry
    1.day.from_now
  end

  def jwt_secret
    Rails.application.credentials.devise_jwt_secret_key || ENV["DEVISE_JWT_SECRET_KEY"]
  end
end
