class Api::V1::TimelineEntriesController < ApplicationController
  def create
    job = Job.find(params[:job_id])
    timeline_entry = job.timeline_entries.new(timeline_entry_params)

    if timeline_entry.save
      render json: timeline_entry, status: :created
    else
      render json: { errors: timeline_entry.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    timeline_entry = TimelineEntry.find(params[:id])

    if timeline_entry.update(timeline_entry_params)
      render json: timeline_entry, status: :ok
    else
      render json: { errors: timeline_entry.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    timeline_entry = TimelineEntry.find(params[:id])
    timeline_entry.destroy

    head :no_content
  end

  private

  def timeline_entry_params
    params.require(:timeline_entry).permit(:entry_type, :description, :occurred_at, :metadata)
  end
end
