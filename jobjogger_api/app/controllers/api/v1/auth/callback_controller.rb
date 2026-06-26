# frozen_string_literal: true

# @api Converts a short-lived OAuth exchange token (JTI) into a JWT session cookie.
# Called by the frontend after the OAuth redirect delivers the JTI query param.
class Api::V1::Auth::CallbackController < ApplicationController
  include JwtCookieable

  def create
    jti = params[:jti]
    return render json: { status: { message: "Missing token." } }, status: :bad_request if jti.blank?

    exchange = OauthExchange.valid.find_by(jti: jti)

    unless exchange
      return render json: { status: { message: "Invalid or expired session." } }, status: :unprocessable_content
    end

    unless request.session.id.to_s == exchange.session_id
      return render json: { status: { message: "Session mismatch." } }, status: :forbidden
    end

    unless exchange.consume!
      return render json: { status: { message: "Invalid or expired session." } }, status: :unprocessable_content
    end

    exchange.user.update_column(:last_sign_in_at, Time.current)
    SignInEvent.create!(user: exchange.user, created_at: Time.current)
    set_jwt_cookie(generate_jwt(exchange.user))
    render json: { user: user_payload(exchange.user) }, status: :ok
  end
end
