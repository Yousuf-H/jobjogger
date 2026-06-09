# frozen_string_literal: true

module Notifications
  class BaseEvaluator
    DEDUP_WINDOW = 24.hours

    def initialize(user)
      @user = user
    end

    private

    def already_notified?(job, kind)
      Notification.where(
        user: @user,
        job:  job,
        kind: kind
      ).where("created_at > ?", DEDUP_WINDOW.ago).exists?
    end

    def create_notification!(job, kind, body)
      return if already_notified?(job, kind)

      Notification.create!(user: @user, job: job, kind: kind, body: body)
    end
  end
end
