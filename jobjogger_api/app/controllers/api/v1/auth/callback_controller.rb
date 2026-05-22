# frozen_string_literal: true

class Api::V1::Auth::CallbackController < ApplicationController
  include JwtCookieable

  def create
    token = params[:token]
    return render json: { status: { message: "Missing token." } }, status: :bad_request if token.blank?

    payload = JWT.decode(token, jwt_secret, true, algorithms: [ "HS256" ]).first

    unless payload["type"] == "exchange"
      return render json: { status: { message: "Invalid token." } }, status: :unprocessable_entity
    end

    user = User.find(payload["sub"])
    set_jwt_cookie(generate_jwt(user))

    render json: { user: user_payload(user) }, status: :ok
  rescue JWT::ExpiredSignature
    render json: { status: { message: "Exchange token expired. Please try signing in again." } }, status: :unprocessable_entity
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { status: { message: "Invalid token." } }, status: :unprocessable_entity
  end
end
