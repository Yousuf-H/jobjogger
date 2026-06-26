# frozen_string_literal: true

# @api Base controller providing shared helpers: catch-all not_found, user payload
# serialization, and Active Storage URL helpers.
class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::Cookies

  def not_found
    render json: { status: { code: 404, message: "Not found." } }, status: :not_found
  end

  protected

  def jwt_secret
    Rails.application.credentials.devise_jwt_secret_key || ENV["DEVISE_JWT_SECRET_KEY"]
  end

  def user_payload(user, avatar_url: avatar_url(user))
    {
      id: user.id,
      email: user.email,
      name: user.name,
      job_title: user.job_title,
      phone: user.phone,
      location: user.location,
      linkedin_url: user.linkedin_url,
      notify_follow_up_reminders: user.notify_follow_up_reminders,
      notify_interview_reminders: user.notify_interview_reminders,
      notify_stage_stall: user.notify_stage_stall,
      notify_deadline_reminder: user.notify_deadline_reminder,
      theme: user.theme,
      default_follow_up_days: user.default_follow_up_days,
      avatar_url: avatar_url,
      demo: user.demo?,
      admin: user.admin?,
      terms_agreed_at: user.terms_agreed_at,
      created_at: user.created_at,
      google_linked: user.google_uid.present?,
      has_password: user.encrypted_password.present?
    }
  end

  def avatar_url(user)
    return nil unless user.avatar.attached?

    Rails.application.routes.url_helpers.rails_blob_url(user.avatar)
  end

  def pdf_url(record)
    return nil unless record.pdf.attached?

    Rails.application.routes.url_helpers.rails_blob_url(record.pdf, disposition: "inline")
  end
end
