# frozen_string_literal: true

# @api Returns recent notifications for the authenticated user and marks them as read.
class Api::V1::NotificationsController < Api::V1::AuthenticatedController
  before_action :set_notification, only: [ :read ]

  def index
    notifications = current_user.notifications
                                .recent
                                .limit(20)
                                .includes(:job)

    render json: {
      notifications: notifications.as_json(
        include: { job: { only: [ :id, :job_title, :company_name ] } }
      ),
      meta: { unread_count: Notification.unread_count_for(current_user) }
    }
  end

  def read
    @notification.mark_read!
    render json: @notification
  end

  def read_all
    current_user.notifications.unread.update_all(read_at: Time.current)
    head :no_content
  end

  private

  def set_notification
    @notification = current_user.notifications.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Notification not found" }, status: :not_found
  end
end
