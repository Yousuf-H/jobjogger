# frozen_string_literal: true

module Notifications
  class DeadlineReminderEvaluator < BaseEvaluator
    LOOKAHEAD_HOURS = 48

    def call
      upcoming_jobs.each do |job|
        hours = hours_until_deadline(job)
        create_notification!(
          job,
          :deadline_reminder,
          "Application deadline for #{job.job_title} at #{job.company_name} is in #{hours} hours."
        )
      end
    end

    private

    def upcoming_jobs
      @user.jobs
           .where(status: [ :wishlist, :applied ])
           .where.not(application_deadline: nil)
           .where(application_deadline: Date.current..LOOKAHEAD_HOURS.hours.from_now.to_date)
    end

    def hours_until_deadline(job)
      deadline_time = job.application_deadline.end_of_day
      ((deadline_time - Time.current) / 1.hour).ceil.clamp(0, LOOKAHEAD_HOURS)
    end
  end
end
