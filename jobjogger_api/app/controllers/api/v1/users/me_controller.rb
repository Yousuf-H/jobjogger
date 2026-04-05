# frozen_string_literal: true

class Api::V1::Users::MeController < Api::V1::AuthenticatedController
  def show
    render json: { user: user_payload(current_user) }, status: :ok
  end
end
