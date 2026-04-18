# frozen_string_literal: true

class Api::V1::InterviewsController < Api::V1::AuthenticatedController
  before_action :set_job
  before_action :set_interview, only: [:update, :destroy]

  def index
    render json: @job.interviews.ordered
  end

  def create
    interview = @job.interviews.build(interview_params)

    if interview.save
      render json: interview, status: :created
    else
      render json: { errors: interview.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @interview.update(interview_params)
      render json: @interview
    else
      render json: { errors: @interview.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @interview.destroy
    head :no_content
  end

  private

  def set_job
    @job = current_user.jobs.find(params[:job_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Job not found" }, status: :not_found
  end

  def set_interview
    @interview = @job.interviews.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Interview not found" }, status: :not_found
  end

  def interview_params
    params.require(:interview).permit(
      :scheduled_at,
      :interview_type,
      :format,
      :location_or_link,
      :prep_notes,
      :debrief_notes,
      :outcome
    )
  end
end
