# frozen_string_literal: true

class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)

    resource.save
    yield resource if block_given?

    if resource.persisted?
      # Generate JWT manually instead of using Devise's sign_in
      token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first

      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: {
          id: resource.id,
          email: resource.email,
          name: resource.name,
          created_at: resource.created_at
        }
      }, status: :ok, headers: { 'Authorization': "Bearer #{token}" }
    else
      clean_up_passwords resource
      set_minimum_password_length
      render json: {
        status: {
          message: "User couldn't be created. #{resource.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end

  def account_update_params
    params.require(:user).permit(:email, :password, :password_confirmation, :current_password, :name)
  end
end