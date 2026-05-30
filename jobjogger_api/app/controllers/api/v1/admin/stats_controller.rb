# frozen_string_literal: true

class Api::V1::Admin::StatsController < Api::V1::Admin::BaseController
  VALID_PERIODS = %w[daily weekly monthly].freeze

  def index
    render json: {
      period: period,
      totals: totals,
      signups_over_time: time_series(real_users, :created_at),
      sessions_over_time: sessions_over_time,
      active_users_over_time: active_users_over_time,
      jobs_over_time: time_series(real_jobs, :created_at),
      demo: demo_stats
    }
  end

  private

  def period
    VALID_PERIODS.include?(params[:period]) ? params[:period] : "daily"
  end

  def trunc_unit
    case period
    when "weekly"  then "week"
    when "monthly" then "month"
    else                "day"
    end
  end

  def window_start
    case period
    when "weekly"  then 12.weeks.ago
    when "monthly" then 12.months.ago
    else                30.days.ago
    end
  end

  def real_users
    User.where(demo: false)
  end

  def real_jobs
    Job.joins(:user).where(users: { demo: false })
  end

  def totals
    {
      users: real_users.count,
      jobs:  real_jobs.count
    }
  end

  def time_series(scope, timestamp_col)
    expr = Arel.sql("date_trunc('#{trunc_unit}', #{timestamp_col})")
    rows = scope
           .where("#{timestamp_col} >= ?", window_start)
           .group(expr)
           .order(expr)
           .count

    rows.map { |date, count| { date: date.to_date.iso8601, count: count } }
  end

  def sessions_over_time
    expr = Arel.sql("date_trunc('#{trunc_unit}', last_sign_in_at)")
    rows = real_users
           .where("last_sign_in_at >= ?", window_start)
           .group(expr)
           .order(expr)
           .count

    rows.map { |date, count| { date: date.to_date.iso8601, count: count } }
  end

  def active_users_over_time
    expr = Arel.sql("date_trunc('#{trunc_unit}', GREATEST(jobs.created_at, jobs.updated_at))")

    counts = real_jobs
             .where("jobs.created_at >= ? OR jobs.updated_at >= ?", window_start, window_start)
             .group(expr)
             .order(expr)
             .count("DISTINCT jobs.user_id")

    counts.map { |date, count| { date: date.to_date.iso8601, count: count } }
  end

  def demo_stats
    demo_user = User.find_by(demo: true)
    return { last_sign_in_at: nil } unless demo_user

    {
      last_sign_in_at: demo_user.last_sign_in_at&.iso8601,
      total_jobs: demo_user.jobs.count
    }
  end
end
