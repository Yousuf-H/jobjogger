# frozen_string_literal: true

module Notifications
  # Abstract base for notification evaluators. Subclasses implement #call to
  # inspect the user's jobs and fire notifications. Provides a 24-hour
  # deduplication window so the same notification is not sent twice in a day.
  class BaseEvaluator
    DEDUP_WINDOW = 24.hours

    # @param user [User]
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
