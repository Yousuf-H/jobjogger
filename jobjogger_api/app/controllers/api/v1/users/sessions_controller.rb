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
        user: user_payload(current_user)
      }
    }, status: :ok
  end

  def user_payload(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: avatar_url(user),
      created_at: user.created_at
    }
  end

  def avatar_url(user)
    return nil unless user.avatar.attached?

    Rails.application.routes.url_helpers.rails_blob_url(user.avatar)
  end
end