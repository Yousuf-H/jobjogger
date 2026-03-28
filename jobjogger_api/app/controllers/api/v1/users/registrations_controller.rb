# frozen_string_literal: true

class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  before_action :authenticate_user!, only: [ :update, :update_password, :destroy ]

  def create
    build_resource(sign_up_params)
    resource.save
    yield resource if block_given?

    if resource.persisted?
      token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first

      response.set_header('Authorization', "Bearer #{token}")

      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: {
          id: resource.id,
          email: resource.email,
          name: resource.name,
          created_at: resource.created_at
        }
      }, status: :ok
    else
      clean_up_passwords resource
      set_minimum_password_length
      render json: {
        status: {
          message: "User couldn't be created. #{resource.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_content
    end
  end

  def update
    if current_user.update(profile_params)
      render json: {
        status: { code: 200, message: 'Profile updated successfully.' },
        data: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name
        }
      }, status: :ok
    else
      render json: {
        status: {
          message: "Profile couldn't be updated. #{current_user.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_content
    end
  end

  def update_password
    current_password = params.dig(:user, :current_password)
    return render json: { status: { message: 'Missing required parameters.' } }, status: :bad_request if current_password.nil?

    if current_user.valid_password?(current_password)
      if current_user.update(password_params)
        render json: {
          status: { code: 200, message: 'Password updated successfully.' }
        }, status: :ok
      else
        render json: {
          status: {
            message: "Password couldn't be updated. #{current_user.errors.full_messages.to_sentence}"
          }
        }, status: :unprocessable_content
      end
    else
      render json: {
        status: { message: 'Current password is incorrect.' }
      }, status: :unprocessable_content
    end
  end

  def destroy
    password = params.dig(:user, :password)
    return render json: { status: { message: 'Missing required parameters.' } }, status: :bad_request if password.nil?

    if current_user.valid_password?(password)
      current_user.destroy
      render json: {
        status: { code: 200, message: 'Account deleted successfully.' }
      }, status: :ok
    else
      render json: {
        status: { message: 'Password is incorrect.' }
      }, status: :unprocessable_content
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end

  def profile_params
    params.require(:user).permit(:email, :name)
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end

  def account_update_params
    params.require(:user).permit(:email, :password, :password_confirmation, :current_password, :name)
  end
end