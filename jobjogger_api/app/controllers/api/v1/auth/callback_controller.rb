# frozen_string_literal: true

class Api::V1::Auth::CallbackController < ApplicationController
  include JwtCookieable

  def create
    jti = params[:jti]
    return render json: { status: { message: "Missing token." } }, status: :bad_request if jti.blank?

    cache_key = "oauth_exchange:#{jti}"
    entry     = Rails.cache.read(cache_key)
    Rails.cache.delete(cache_key)

    unless entry
      return render json: { status: { message: "Invalid or expired session." } }, status: :unprocessable_entity
    end

    unless request.session.id.to_s == entry[:session_id]
      return render json: { status: { message: "Session mismatch." } }, status: :forbidden
    end

    user = User.find(entry[:user_id])
    set_jwt_cookie(generate_jwt(user))
    render json: { user: user_payload(user) }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { status: { message: "Invalid or expired session." } }, status: :unprocessable_entity
  end
end
