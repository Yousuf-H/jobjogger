# frozen_string_literal: true

module Notifications
  # Fires a deadline_reminder notification for each wishlist or applied job whose
  # application_deadline falls within the next 48 hours. Comparison is done
  # date-to-date in SQL to avoid UTC vs app-timezone mismatches. Respects the
  # user's notify_deadline_reminder preference.
  class DeadlineReminderEvaluator < BaseEvaluator
    LOOKAHEAD_HOURS = 48

    # @return [void]
    def call
      return unless @user.notify_deadline_reminder?

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
      # Compute both bounds in Ruby using the app timezone so no SQL timezone
      # conversion is needed. application_deadline is a date column — comparing
      # date-to-date in SQL avoids the UTC-vs-app-zone mismatch that arises when
      # casting a date to timestamp (PostgreSQL treats it as midnight UTC).
      #
      # upper_date: the latest deadline date whose end_of_day (in Time.zone) falls
      # within the lookahead window. Derived by: end_of_day(D) <= cutoff
      # ↔ D + 86399s <= cutoff ↔ D <= (cutoff - 86399s).in_time_zone.to_date
      cutoff     = LOOKAHEAD_HOURS.hours.from_now
      upper_date = (cutoff - 86399.seconds).in_time_zone.to_date

      @user.jobs
           .where(archived_at: nil)
           .where(status: [ :wishlist, :applied ])
           .where.not(application_deadline: nil)
           .where(application_deadline: Date.current..upper_date)
    end

    def hours_until_deadline(job)
      deadline_time = job.application_deadline.end_of_day
      ((deadline_time - Time.current) / 1.hour).ceil.clamp(0, LOOKAHEAD_HOURS)
    end
  end
end
