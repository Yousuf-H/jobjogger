# frozen_string_literal: true

class Api::V1::AnalyticsController < Api::V1::AuthenticatedController
  def index
    render json: {
      funnel_data: funnel_data,
      summary_stats: summary_stats,
      activity: activity_data,
      source_performance: source_performance_data,
      stage_durations: stage_duration_data
    }
  end

  private

  APPLIED_STATUSES = %w[applied phone_screen interviewing offer accepted rejected ghosted withdrawn].freeze
  RESPONSE_STATUSES = %w[phone_screen interviewing offer accepted rejected].freeze
  INTERVIEW_STATUSES = %w[interviewing offer accepted].freeze

  def jobs
    current_user.jobs
  end

  def calculate_percentage(numerator, denominator)
    return 0 if denominator < 1
    (numerator / denominator.to_f * 100).round(1)
  end

  # Count jobs that EVER reached any of the given statuses (via timeline history)
  def jobs_that_reached(statuses, scope = jobs)
    scope
      .joins(:timeline_entries)
      .where(timeline_entries: { entry_type: "status_change" })
      .where("timeline_entries.metadata->>'to' IN (?)", statuses)
      .distinct
  end

  # ── Funnel ────────────────────────────────────────────────────────────────────

  def funnel_data
    statuses = %w[wishlist applied phone_screen interviewing offer accepted rejected ghosted withdrawn]
    counts = jobs.where(archived_at: nil).group(:status).count

    statuses.map do |s|
      { status: s, count: counts.fetch(s, 0) }
    end
  end

  # ── Summary stats ─────────────────────────────────────────────────────────────

  def summary_stats
    total_applied = jobs_that_reached(APPLIED_STATUSES).count

    response_count = jobs_that_reached(RESPONSE_STATUSES).count
    response_rate = calculate_percentage(response_count, total_applied)

    interview_count = jobs_that_reached(INTERVIEW_STATUSES).count
    interview_rate = calculate_percentage(interview_count, total_applied)

    avg_days_to_respond = average_days_between_statuses("applied", RESPONSE_STATUSES)

    {
      total_applied: total_applied,
      response_rate: response_rate,
      interview_rate: interview_rate,
      avg_days_to_respond: avg_days_to_respond
    }
  end

  # ── Activity (weekly/monthly) ─────────────────────────────────────────────────

  def activity_data
    {
      weekly: activity_by_period("week"),
      monthly: activity_by_period("month")
    }
  end

  def activity_by_period(period)
    # Prefer date_applied (user-set backdate) over the timeline entry's occurred_at
    # (which falls back to created_at). The INNER JOIN on the applied timeline entry
    # is the authoritative "was ever applied" filter — it exists for every non-wishlist
    # job regardless of current status or whether date_applied was explicitly set.
    date_expr = "COALESCE(jobs.date_applied::timestamp, first_applied.occurred_at)"
    trunc_fn = "date_trunc('#{period}', #{date_expr})"

    lateral = <<~SQL.squish
      INNER JOIN LATERAL (
        SELECT MIN(occurred_at) AS occurred_at
        FROM timeline_entries
        WHERE timeline_entries.job_id = jobs.id
          AND timeline_entries.entry_type = 'status_change'
          AND timeline_entries.metadata->>'to' = 'applied'
      ) first_applied ON first_applied.occurred_at IS NOT NULL
    SQL

    results = jobs
      .joins(lateral)
      .select("#{trunc_fn} AS period, COUNT(*) AS count")
      .group("period")
      .order("period ASC")

    results.map do |r|
      {
        period: r.period.to_date.iso8601,
        count: r.count
      }
    end
  end

  # ── Source performance ────────────────────────────────────────────────────────

  def source_performance_data
    sources = %w[seek linkedin referral company_site other]

    total_by_source = {}
    interview_by_source = {}

    sources.each do |source|
      scoped = jobs.where(source: source)
      total_by_source[source] = jobs_that_reached(APPLIED_STATUSES, scoped).count
      interview_by_source[source] = jobs_that_reached(INTERVIEW_STATUSES, scoped).count
    end

    sources.map do |source|
      {
        source: source,
        applied: total_by_source[source] || 0,
        got_interview: interview_by_source[source] || 0
      }
    end
  end

  # ── Stage durations ───────────────────────────────────────────────────────────

  def stage_duration_data
    transitions = [
      { from: "applied", to: "phone_screen", label: "Applied → Phone screen" },
      { from: "phone_screen", to: "interviewing", label: "Phone screen → Interview" },
      { from: "interviewing", to: "offer", label: "Interview → Offer" },
      { from: "offer", to: "accepted", label: "Offer → Accepted" }
    ]

    transitions.map do |t|
      avg_days = average_days_between_statuses(t[:from], [ t[:to] ])
      {
        label: t[:label],
        avg_days: avg_days
      }
    end
  end

  # ── Shared helper ─────────────────────────────────────────────────────────────

  def average_days_between_statuses(from_status, to_statuses)
    to_conditions = to_statuses.map { "te_to.metadata->>'to' = ?" }.join(" OR ")

    query = <<-SQL
      SELECT AVG(days) AS avg_days
      FROM (
        SELECT DISTINCT ON (te_from.job_id, te_from.id)
          EXTRACT(EPOCH FROM (te_to.occurred_at - te_from.occurred_at)) / 86400 AS days
        FROM timeline_entries te_from
        INNER JOIN timeline_entries te_to ON te_from.job_id = te_to.job_id
        INNER JOIN jobs ON jobs.id = te_from.job_id
        WHERE jobs.user_id = ?
          AND te_from.entry_type = 'status_change'
          AND te_to.entry_type = 'status_change'
          AND te_from.metadata->>'to' = ?
          AND (#{to_conditions})
          AND te_to.occurred_at > te_from.occurred_at
        ORDER BY te_from.job_id, te_from.id, te_to.occurred_at ASC
      ) earliest_transitions
    SQL

    result = ActiveRecord::Base.connection.exec_query(
      ActiveRecord::Base.sanitize_sql_array([ query, current_user.id, from_status ] + to_statuses)
    )

    avg = result.rows.first&.first
    avg ? avg.to_f.round(1) : nil
  end
end
