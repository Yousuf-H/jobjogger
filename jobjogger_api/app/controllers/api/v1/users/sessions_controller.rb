# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  include JwtCookieable

  skip_before_action :verify_signed_out_user, only: :destroy
  respond_to :json

  def destroy
    delete_jwt_cookie

    render json: {
      status: 200,
      message: 'Signed out successfully.'
    }, status: :ok
  end

  private

  def respond_with(current_user, _opts = {})
    current_user.update_column(:last_sign_in_at, Time.current)
    SignInEvent.create!(user: current_user, created_at: Time.current)
    set_jwt_cookie(generate_jwt(current_user))

    render json: {
      status: {
        code: 200,
        message: 'Signed in successfully.',
        user: user_payload(current_user)
      }
    }, status: :ok
  end
end