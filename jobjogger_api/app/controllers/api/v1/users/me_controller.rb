# frozen_string_literal: true

class Api::V1::Users::MeController < Api::V1::AuthenticatedController
  def show
    render json: { user: user_payload(current_user) }, status: :ok
  end

  def accept_terms
    current_user.update!(terms_agreed_at: Time.current) if current_user.terms_agreed_at.nil?
    render json: { user: user_payload(current_user) }, status: :ok
  end
end
