# frozen_string_literal: true

# Concern that provides JWT-cookie authentication helpers. Reads the signed :jwt cookie,
# decodes it with HS256, and sets @current_user. Renders 401 on any failure.
# Included in AuthenticatedController (and RegistrationsController for protected actions).
module JwtAuthenticatable
  extend ActiveSupport::Concern

  private

  def authenticate_user!
    token = cookies.signed[:jwt]

    if token.nil?
      render json: { status: { code: 401, message: "Unauthorized." } }, status: :unauthorized
      return
    end

    begin
      payload = JWT.decode(token, jwt_secret, true, { algorithm: "HS256" }).first

      @current_user = User.find(payload["sub"])
    rescue JWT::ExpiredSignature
      render json: { status: { code: 401, message: "Session expired. Please sign in again." } }, status: :unauthorized
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { status: { code: 401, message: "Unauthorized." } }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
