module JwtCookieable
  extend ActiveSupport::Concern

  private

  def generate_jwt(user)
    payload = {
      sub: user.id,
      exp: 1.day.from_now.to_i,
      iat: Time.now.to_i
    }

    JWT.encode(
      payload,
      Rails.application.credentials.devise_jwt_secret_key || ENV["DEVISE_JWT_SECRET_KEY"],
      "HS256"
    )
  end

  def set_jwt_cookie(token)
    cookies.signed[:jwt] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :none,
      domain: cookie_domain,
      expires: 1.day.from_now
    }
  end

  def delete_jwt_cookie
    cookies.delete(:jwt, domain: cookie_domain)
  end

  def cookie_domain
    Rails.env.production? ? ".jobjogger.com" : "localhost"
  end
end
