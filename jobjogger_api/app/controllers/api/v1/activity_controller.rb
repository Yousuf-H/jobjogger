# frozen_string_literal: true

class Api::V1::ActivityController < Api::V1::AuthenticatedController
  def index
    per_page = params.fetch(:per_page, 5).to_i.clamp(1, 50)
    page     = params.fetch(:page, 1).to_i.clamp(1, 1_000)

    scope = TimelineEntry
      .joins(:job)
      .includes(:job)
      .where(jobs: { user_id: current_user.id })
      .order(occurred_at: :desc)

    total   = scope.count
    entries = scope.limit(per_page).offset((page - 1) * per_page)

    render json: {
      entries: entries.map { |entry|
        entry.as_json.merge(
          "company_name" => entry.job.company_name,
          "job_title"    => entry.job.job_title
        )
      },
      meta: {
        total:       total,
        page:        page,
        per_page:    per_page,
        total_pages: (total.to_f / per_page).ceil
      }
    }
  end
end
