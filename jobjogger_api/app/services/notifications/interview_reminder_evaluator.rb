# frozen_string_literal: true

module Notifications
  class InterviewReminderEvaluator < BaseEvaluator
    def call
      # TODO: Interview reminder notifications not yet implemented.
      # When ready: query interviews where scheduled_at is within 24 hours and no
      # interview_reminder notification exists for that job in the last 24 hours.
      Rails.logger.info("[InterviewReminderEvaluator] Skipping — not yet implemented")
    end
  end
end
