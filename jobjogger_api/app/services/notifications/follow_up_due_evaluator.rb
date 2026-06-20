# frozen_string_literal: true

module Notifications
  class FollowUpDueEvaluator < BaseEvaluator
    def call
      return unless @user.notify_follow_up_reminders?

      due_jobs.each do |job|
        create_notification!(
          job,
          :follow_up_due,
          "Your scheduled follow-up for #{job.job_title} at #{job.company_name} is due today."
        )
      end
    end

    private

    def due_jobs
      @user.jobs
           .active
           .where.not(follow_up_date: nil)
           .where("follow_up_date <= ?", Date.current)
    end
  end
end
