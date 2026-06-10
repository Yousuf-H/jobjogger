# frozen_string_literal: true

class NotificationEvaluatorJob < ApplicationJob
  queue_as :default

  def perform
    User.where(demo: false).find_each do |user|
      Notifications::StageStallEvaluator.new(user).call
      Notifications::DeadlineReminderEvaluator.new(user).call
      Notifications::FollowUpDueEvaluator.new(user).call
      Notifications::InterviewReminderEvaluator.new(user).call
    rescue => e
      Rails.logger.error("[NotificationEvaluatorJob] Error for user #{user.id}: #{e.message}")
    end
  end
end
