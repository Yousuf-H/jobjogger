# frozen_string_literal: true

# @api Base for admin-only controllers. Enforces admin? check after JWT authentication.
class Api::V1::Admin::BaseController < Api::V1::AuthenticatedController
  before_action :require_admin!

  private

  def require_admin!
    render json: { error: "Forbidden." }, status: :forbidden unless current_user.admin?
  end
end
