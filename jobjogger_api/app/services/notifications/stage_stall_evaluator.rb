# frozen_string_literal: true

module Notifications
  class StageStallEvaluator < BaseEvaluator
    STALL_DAYS = 14

    def call
      stalled_jobs.each do |job|
        days = days_since_update(job)
        create_notification!(
          job,
          :stage_stall,
          "#{job.job_title} at #{job.company_name} has been in '#{job.status.humanize}' for #{days} days with no activity."
        )
      end
    end

    private

    def stalled_jobs
      @user.jobs.active.where("updated_at <= ?", STALL_DAYS.days.ago)
    end

    def days_since_update(job)
      ((Time.current - job.updated_at) / 1.day).floor
    end
  end
end
