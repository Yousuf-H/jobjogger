# frozen_string_literal: true

# Handles the Google OAuth2 callback from OmniAuth. On sign-in, creates a short-lived
# OauthExchange record and redirects the browser to the frontend with the JTI. On link,
# attaches the Google UID to the current user's account.
class OmniauthCallbacksController < ApplicationController
  include JwtCookieable

  def google_oauth2
    auth = request.env["omniauth.auth"]
    params = request.env["omniauth.params"].to_h

    if params["link"] == "true"
      handle_link(auth)
    else
      handle_signin(auth)
    end
  rescue StandardError => e
    Rails.logger.error("Google OAuth callback error: #{e.message}")
    redirect_to "#{frontend_url}/signin?oauth_error=true", allow_other_host: true
  end

  private

  def handle_signin(auth)
    user     = User.from_google(auth)
    exchange = OauthExchange.create_for(user: user, session_id: request.session.id.to_s)
    redirect_to "#{frontend_url}/auth/callback?jti=#{exchange.jti}", allow_other_host: true
  end

  def handle_link(auth)
    user = current_user_from_jwt
    unless user
      redirect_to "#{frontend_url}/signin", allow_other_host: true
      return
    end

    if user.demo?
      redirect_to "#{frontend_url}/profile?oauth_error=demo_account", allow_other_host: true
      return
    end

    if User.where(google_uid: auth.uid).where.not(id: user.id).exists?
      redirect_to "#{frontend_url}/profile?oauth_error=google_taken", allow_other_host: true
      return
    end

    user.update!(google_uid: auth.uid)
    redirect_to "#{frontend_url}/auth/callback?redirect=/profile", allow_other_host: true
  end

  def current_user_from_jwt
    token = cookies.signed[:jwt]
    return nil unless token

    payload = JWT.decode(token, jwt_secret, true, algorithms: [ "HS256" ]).first
    User.find_by(id: payload["sub"])
  rescue JWT::DecodeError
    nil
  end

  def frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  end
end
