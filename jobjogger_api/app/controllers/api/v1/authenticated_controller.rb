class Api::V1::AuthenticatedController < ApplicationController
  before_action :authenticate_user_from_token!

  private

  def authenticate_user_from_token!
    token = request.headers['Authorization']&.split(' ')&.last
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless token

    begin
      jwt_payload = JWT.decode(token,
                               Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY'],
                               true,
                               { algorithm: 'HS256' }).first

      if JwtDenylist.find_by(jti: jwt_payload['jti'])
        render json: { error: "Token has been revoked" }, status: :unauthorized
      else
        @current_user = User.find(jwt_payload['sub'])
      end
    rescue JWT::ExpiredSignature
      render json: { error: 'Token has expired' }, status: :unauthorized
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end