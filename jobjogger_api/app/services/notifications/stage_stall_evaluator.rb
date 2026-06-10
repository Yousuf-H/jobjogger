# frozen_string_literal: true

module Notifications
  class StageStallEvaluator < BaseEvaluator
    STALL_DAYS = 14

    def call
      stalled_jobs.each do |job|
        days = days_since_status_change(job)
        create_notification!(
          job,
          :stage_stall,
          "#{job.job_title} at #{job.company_name} has been in '#{job.status.humanize}' for #{days} days with no activity."
        )
      end
    end

    private

    # Subquery returns the most recent status_change timeline entry's occurred_at.
    # COALESCE falls back to created_at for wishlist jobs that have no timeline entries.
    LAST_STATUS_CHANGE_SQL = <<~SQL.squish
      COALESCE(
        (SELECT MAX(occurred_at) FROM timeline_entries
         WHERE job_id = jobs.id AND entry_type = 'status_change'),
        jobs.created_at
      )
    SQL

    def stalled_jobs
      @user.jobs
           .active
           .select("jobs.*, (#{LAST_STATUS_CHANGE_SQL}) AS last_status_change_at")
           .where("(#{LAST_STATUS_CHANGE_SQL}) <= ?", STALL_DAYS.days.ago)
    end

    def days_since_status_change(job)
      ((Time.current - job.last_status_change_at.to_time) / 1.day).floor
    end
  end
end
