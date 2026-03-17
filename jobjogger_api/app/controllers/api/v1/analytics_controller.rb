# frozen_string_literal: true

class Api::V1::AnalyticsController < Api::V1::AuthenticatedController
  def index
    render json: {
      summary: summary_stats,
      activity: activity_data,
      funnel: funnel_data,
      source_performance: source_performance_data,
      stage_durations: stage_duration_data
    }
  end

  private

  def jobs
    @jobs ||= current_user.jobs
  end

  # ── Summary metric cards ──────────────────────────────────────────────────────

  def summary_stats
    total_applied = jobs.where.not(status: "wishlist").count
    total_with_response = jobs.where(status: %w[phone_screen interviewing offer accepted]).count
    total_with_interview = jobs.where(status: %w[phone_screen interviewing offer accepted]).count

    # Average days from applied to first response (phone_screen or interviewing)
    avg_response_days = average_days_between_statuses("applied", %w[phone_screen interviewing offer accepted rejected ghosted])

    {
      total_applied: total_applied,
      response_rate: total_applied > 0 ? (total_with_response.to_f / total_applied * 100).round(1) : 0,
      interview_rate: total_applied > 0 ? (total_with_interview.to_f / total_applied * 100).round(1) : 0,
      avg_days_to_respond: avg_response_days
    }
  end

  # ── Application activity over time ────────────────────────────────────────────

  def activity_data
    {
      weekly: activity_by_period("week"),
      monthly: activity_by_period("month")
    }
  end

  def activity_by_period(period)
    trunc_fn = period == "week" ? "date_trunc('week', created_at)" : "date_trunc('month', created_at)"

    results = jobs
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

  # ── Pipeline funnel (current snapshot) ────────────────────────────────────────

  def funnel_data
    status_order = %w[wishlist applied phone_screen interviewing offer accepted rejected ghosted withdrawn]

    counts = jobs.group(:status).count

    status_order.map do |status|
      {
        status: status,
        count: counts[status] || 0
      }
    end
  end

  # ── Response rate by source ───────────────────────────────────────────────────

  def source_performance_data
    sources = %w[seek linkedin referral company_site other]

    total_by_source = jobs.where.not(status: "wishlist").group(:source).count
    interview_by_source = jobs.where(status: %w[phone_screen interviewing offer accepted]).group(:source).count

    sources.map do |source|
      {
        source: source,
        applied: total_by_source[source] || 0,
        got_interview: interview_by_source[source] || 0
      }
    end
  end

  # ── Average time between stages ───────────────────────────────────────────────

  def stage_duration_data
    transitions = [
      { from: "applied", to: "phone_screen", label: "Applied → Phone screen" },
      { from: "phone_screen", to: "interviewing", label: "Phone screen → Interview" },
      { from: "interviewing", to: "offer", label: "Interview → Offer" },
      { from: "offer", to: "accepted", label: "Offer → Accepted" }
    ]

    transitions.map do |t|
      avg_days = average_days_between_statuses(t[:from], [t[:to]])
      {
        label: t[:label],
        avg_days: avg_days
      }
    end
  end

  # ── Helpers ───────────────────────────────────────────────────────────────────

  def average_days_between_statuses(from_status, to_statuses)
    # Use timeline entries to calculate time between status changes
    # Find pairs of status_change entries for the same job
    query = <<-SQL
      SELECT AVG(EXTRACT(EPOCH FROM (te_to.occurred_at - te_from.occurred_at)) / 86400) AS avg_days
      FROM timeline_entries te_from
      INNER JOIN timeline_entries te_to ON te_from.job_id = te_to.job_id
      INNER JOIN jobs ON jobs.id = te_from.job_id
      WHERE jobs.user_id = ?
        AND te_from.entry_type = 'status_change'
        AND te_to.entry_type = 'status_change'
        AND te_from.description LIKE ?
        AND (#{to_statuses.map { "te_to.description LIKE ?" }.join(" OR ")})
        AND te_to.occurred_at > te_from.occurred_at
    SQL

    from_pattern = "%to #{from_status}%"
    to_patterns = to_statuses.map { |s| "%to #{s}%" }
    binds = [current_user.id, from_pattern] + to_patterns

    result = ActiveRecord::Base.connection.exec_query(
      ActiveRecord::Base.sanitize_sql_array([query] + binds)
    )

    avg = result.rows.first&.first
    avg ? avg.round(1) : nil
  end
end