# frozen_string_literal: true

# @api Manages user registration, profile updates, password changes, avatar, Google linking,
# notification preferences, and account deletion. Demo accounts are blocked from mutations.
class Api::V1::Users::RegistrationsController < Devise::RegistrationsController
  include JwtCookieable
  include JwtAuthenticatable

  respond_to :json
  skip_before_action :authenticate_scope!, raise: false
  before_action :authenticate_user!, only: [ :update, :update_password, :set_initial_password, :destroy, :update_avatar, :delete_avatar, :unlink_google, :update_notification_prefs, :update_preferences ]
  before_action :prevent_demo_changes, only: [ :update, :update_password, :set_initial_password, :destroy, :update_avatar, :delete_avatar, :unlink_google, :update_notification_prefs, :update_preferences ]

  def create
    build_resource(sign_up_params)
    resource.save
    yield resource if block_given?

    if resource.persisted?
      resource.update_column(:last_sign_in_at, Time.current)
      SignInEvent.create(user: resource, created_at: Time.current)
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
    if email_changing?
      current_password = params.dig(:user, :current_password)
      if current_password.blank?
        return render json: {
          status: { message: 'Password is required to change your email.' }
        }, status: :unprocessable_content
      end
      unless current_user.valid_password?(current_password)
        return render json: {
          status: { message: 'Incorrect password.' }
        }, status: :unprocessable_content
      end
    end

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
    if current_user.encrypted_password.present?
      password = params.dig(:user, :password)
      return render json: { status: { message: 'Missing required parameters.' } }, status: :bad_request if password.nil?
      unless current_user.valid_password?(password)
        return render json: { status: { message: 'Password is incorrect.' } }, status: :unprocessable_content
      end
    end

    current_user.destroy
    delete_jwt_cookie
    render json: {
      status: { code: 200, message: 'Account deleted successfully.' }
    }, status: :ok
  end

  def set_initial_password
    if current_user.encrypted_password.present?
      return render json: {
        status: { message: 'Use the change password form to update your existing password.' }
      }, status: :unprocessable_content
    end

    if params.dig(:user, :password).blank?
      return render json: {
        status: { message: "Password can't be blank." }
      }, status: :unprocessable_content
    end

    if current_user.update(password_params)
      render json: {
        status: { code: 200, message: 'Password set successfully.' },
        user: user_payload(current_user)
      }, status: :ok
    else
      render json: {
        status: {
          message: "Password couldn't be set. #{current_user.errors.full_messages.to_sentence}"
        }
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

  def unlink_google
    unless current_user.google_uid.present?
      return render json: { status: { message: 'No Google account linked.' } }, status: :unprocessable_content
    end

    unless current_user.encrypted_password.present?
      return render json: {
        status: { message: 'Set a password before unlinking Google so you can still sign in.' }
      }, status: :unprocessable_content
    end

    current_user.update!(google_uid: nil)
    render json: {
      status: { code: 200, message: 'Google account unlinked.' },
      user: user_payload(current_user)
    }, status: :ok
  end

  def update_notification_prefs
    if current_user.update(notification_pref_params)
      render json: {
        status: { code: 200, message: 'Notification preferences updated.' },
        user: user_payload(current_user)
      }, status: :ok
    else
      render json: {
        status: {
          message: "Couldn't update preferences. #{current_user.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_content
    end
  end

  def update_preferences
    if current_user.update(preferences_params)
      render json: {
        status: { code: 200, message: 'Preferences updated.' },
        user: user_payload(current_user)
      }, status: :ok
    else
      render json: {
        status: {
          message: "Couldn't update preferences. #{current_user.errors.full_messages.to_sentence}"
        }
      }, status: :unprocessable_content
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
    params.require(:user).permit(:email, :name, :phone, :location, :linkedin_url, :job_title)
  end

  def notification_pref_params
    params.require(:user).permit(
      :notify_follow_up_reminders,
      :notify_interview_reminders,
      :notify_stage_stall,
      :notify_deadline_reminder
    )
  end

  def preferences_params
    params.require(:user).permit(:theme, :default_follow_up_days)
  end

  def email_changing?
    new_email = params.dig(:user, :email)
    new_email.present? && new_email != current_user.email
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end

  def prevent_demo_changes
    if current_user.demo?
      render json: { status: { message: "Demo account cannot be modified." } },
             status: :forbidden
    end
  end
end