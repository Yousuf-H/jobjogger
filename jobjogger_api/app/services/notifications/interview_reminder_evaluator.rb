# frozen_string_literal: true

module Notifications
  class InterviewReminderEvaluator < BaseEvaluator
    LOOKAHEAD_HOURS = 24

    def call
      upcoming_interviews.each do |interview|
        job = interview.job
        hours = ((interview.scheduled_at - Time.current) / 1.hour).ceil
        create_notification!(
          job,
          :interview_reminder,
          "You have a #{interview.interview_type.humanize.downcase} interview for #{job.job_title} at #{job.company_name} in #{hours} hours."
        )
      end
    end

    private

    def upcoming_interviews
      Interview
        .joins(:job)
        .where(jobs: { user_id: @user.id, archived_at: nil })
        .where("interviews.scheduled_at > ?", Time.current)
        .where("interviews.scheduled_at <= ?", LOOKAHEAD_HOURS.hours.from_now)
        .includes(:job)
    end
  end
end
