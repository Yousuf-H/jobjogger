# frozen_string_literal: true

module Notifications
  class FollowUpDueEvaluator < BaseEvaluator
    IDLE_DAYS = 7

    def call
      idle_jobs.each do |job|
        days = days_since_update(job)
        create_notification!(
          job,
          :follow_up_due,
          "No activity on #{job.job_title} at #{job.company_name} in #{days} days — consider sending a follow-up."
        )
      end
    end

    private

    def idle_jobs
      @user.jobs.active.where("updated_at <= ?", IDLE_DAYS.days.ago)
    end

    def days_since_update(job)
      ((Time.current - job.updated_at) / 1.day).floor
    end
  end
end
