# frozen_string_literal: true

class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  include JwtCookieable
  include JwtAuthenticatable

  respond_to :json
  skip_before_action :authenticate_scope!, raise: false
  before_action :authenticate_user!, only: [ :update, :update_password, :destroy, :update_avatar, :delete_avatar ]
  before_action :prevent_demo_changes, only: [ :update, :update_password, :destroy, :update_avatar, :delete_avatar ]

  def create
    build_resource(sign_up_params)
    resource.save
    yield resource if block_given?

    if resource.persisted?
      set_jwt_cookie(generate_jwt(resource))

      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        user: user_payload(resource)
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
        user: user_payload(current_user)
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
      delete_jwt_cookie
      render json: {
        status: { code: 200, message: 'Account deleted successfully.' }
      }, status: :ok
    else
      render json: {
        status: { message: 'Password is incorrect.' }
      }, status: :unprocessable_content
    end
  end

  def update_avatar
    unless params[:avatar].is_a?(ActionDispatch::Http::UploadedFile)
      render json: { status: { message: 'No file provided.' } }, status: :unprocessable_content
      return
    end

    unless params[:avatar].content_type.in?(%w[image/png image/jpeg image/webp])
      render json: { status: { message: 'File must be PNG, JPEG, or WebP.' } }, status: :unprocessable_content
      return
    end

    if params[:avatar].size > 5.megabytes
      render json: { status: { message: 'File must be less than 5MB.' } }, status: :unprocessable_content
      return
    end

    old_blob = current_user.avatar.blob if current_user.avatar.attached?
    current_user.avatar.attach(params[:avatar])
    old_blob&.purge_later

    render json: {
      status: { code: 200, message: 'Avatar updated successfully.' },
      user: user_payload(current_user)
    }, status: :ok
  end

  def delete_avatar
    if current_user.avatar.attached?
      current_user.avatar.purge
      render json: {
        status: { code: 200, message: 'Avatar removed.' },
        user: user_payload(current_user, avatar_url: nil)
      }, status: :ok
    else
      render json: { status: { message: 'No avatar to remove.' } }, status: :unprocessable_content
    end
  end

  private

  def sign_up_params
    permitted = params.require(:user).permit(:email, :password, :password_confirmation, :name, :agreed_to_terms)
    if permitted.delete(:agreed_to_terms).in?([ true, "true", "1" ])
      permitted[:terms_agreed_at] = Time.current
    end
    permitted
  end

  def profile_params
    params.require(:user).permit(:email, :name)
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end

  def user_payload(user, avatar_url: avatar_url(user))
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: avatar_url,
      terms_agreed_at: user.terms_agreed_at,
      created_at: user.created_at
    }
  end

  def prevent_demo_changes
    if current_user.demo?
      render json: { status: { message: "Demo account cannot be modified." } },
             status: :forbidden
    end
  end
end