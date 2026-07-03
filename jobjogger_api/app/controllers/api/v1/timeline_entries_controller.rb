# frozen_string_literal: true

# @api Manages timeline entries for the authenticated user's jobs.
# All three operations (create, update, destroy) are top-level routes — job_id is
# supplied in the request body for create rather than in the URL path.
class Api::V1::TimelineEntriesController < Api::V1::AuthenticatedController
  before_action :set_timeline_entry, only: [:update, :destroy]

  def create
    job_id = params.dig(:timeline_entry, :job_id) || params[:job_id]
    job = current_user.jobs.find(job_id)
    timeline_entry = job.timeline_entries.build(timeline_entry_params)

    if timeline_entry.save
      render json: timeline_entry, status: :created
    else
      render json: { errors: timeline_entry.errors.full_messages }, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Job not found' }, status: :not_found
  end

  def update
    saved = false
    ActiveRecord::Base.transaction do
      saved = @timeline_entry.update(timeline_entry_params)
      sync_date_applied_if_needed if saved
      raise ActiveRecord::Rollback unless saved
    end

    if saved
      render json: @timeline_entry, status: :ok
    else
      render json: { errors: @timeline_entry.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @timeline_entry.destroy
    head :no_content
  end

  private

  def set_timeline_entry
    @timeline_entry = TimelineEntry.joins(:job)
                                   .where(jobs: { user_id: current_user.id })
                                   .find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Timeline entry not found' }, status: :not_found
  end

  def timeline_entry_params
    params.require(:timeline_entry).permit(:entry_type, :description, :occurred_at, metadata: {})
  end

  def sync_date_applied_if_needed
    return unless @timeline_entry.status_change?
    return unless @timeline_entry.metadata&.dig('to') == 'applied'

    earliest = @timeline_entry.job.timeline_entries
      .where(entry_type: 'status_change')
      .where("metadata->>'to' = 'applied'")
      .reorder(occurred_at: :asc)
      .first

    return unless earliest

    # Prefer the browser-supplied local calendar date (applied_date param) to
    # avoid UTC/local-day mismatch near day boundaries. Fall back to the UTC
    # date of the earliest applied timestamp only when not provided.
    date_value = params.dig(:timeline_entry, :applied_date).presence ||
                 earliest.occurred_at.to_date

    @timeline_entry.job.update_column(:date_applied, date_value)
  end
end
