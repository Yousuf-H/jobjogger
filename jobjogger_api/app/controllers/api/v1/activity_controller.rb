# frozen_string_literal: true

class Api::V1::ActivityController < Api::V1::AuthenticatedController
  def index
    limit = params.fetch(:limit, 5).to_i.clamp(1, 100)

    entries = TimelineEntry
      .joins(:job)
      .includes(:job)
      .where(jobs: { user_id: current_user.id })
      .order(occurred_at: :desc)
      .limit(limit)

    render json: entries.map { |entry|
      entry.as_json.merge(
        'company_name' => entry.job.company_name,
        'job_title'    => entry.job.job_title
      )
    }
  end
end
