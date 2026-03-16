# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_signed_out_user, only: :destroy
  respond_to :json

  def destroy
    if request.headers['Authorization'].present?
      begin
        token = request.headers['Authorization'].split(' ').last

        jwt_payload = JWT.decode(
          token,
          Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY'],
          true,
          { algorithm: 'HS256' }
        ).first

        user = User.find(jwt_payload['sub'])

        # Add token to denylist
        sign_out(user)

        render json: {
          status: 200,
          message: 'Logged out successfully.'
        }, status: :ok
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: {
          status: 401,
          message: "Invalid or expired token."
        }, status: :unauthorized
      end
    else
      render json: {
        status: 401,
        message: "No authorization token provided."
      }, status: :unauthorized
    end
  end

  private

  def respond_with(current_user, _opts = {})
    render json: {
      status: {
        code: 200,
        message: 'Logged in successfully.',
        user: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name
        }
      }
    }, status: :ok
  end
end