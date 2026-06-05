# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::Cookies

  def not_found
    render json: { status: { code: 404, message: "Not found." } }, status: :not_found
  end

  protected

  def user_payload(user)
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: avatar_url(user),
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
