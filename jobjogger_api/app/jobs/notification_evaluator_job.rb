# frozen_string_literal: true

# Background job that runs all four notification evaluators for every non-demo user.
# Intended to be enqueued on a recurring schedule (e.g. daily via a cron adapter).
# Each evaluator is called independently; errors for one user are logged and do not
# abort evaluation for subsequent users.
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
