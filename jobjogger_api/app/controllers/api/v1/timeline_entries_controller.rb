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
    if @timeline_entry.update(timeline_entry_params)
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
end
