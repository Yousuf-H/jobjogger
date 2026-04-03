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
      created_at: user.created_at
    }
  end

  def avatar_url(user)
    return nil unless user.avatar.attached?

    Rails.application.routes.url_helpers.rails_blob_url(user.avatar)
  end
end
