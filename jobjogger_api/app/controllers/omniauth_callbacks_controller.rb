# frozen_string_literal: true

class OmniauthCallbacksController < ApplicationController
  include JwtCookieable

  def google_oauth2
    auth = request.env["omniauth.auth"]
    user = User.from_google(auth)

    set_jwt_cookie(generate_jwt(user))
    redirect_to frontend_url, allow_other_host: true
  rescue StandardError => e
    Rails.logger.error("Google OAuth callback error: #{e.message}")
    redirect_to "#{frontend_url}/signin?oauth_error=true", allow_other_host: true
  end

  private

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end
end
