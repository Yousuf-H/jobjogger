# frozen_string_literal: true

class Api::V1::JobInterviewQuestionsController < Api::V1::AuthenticatedController
  before_action :set_job

  def index
    questions = @job.pinned_questions.order(:category, :created_at)
    render json: questions
  end

  def create
    if params[:interview_question_id].present?
      associate_existing
    else
      create_and_associate
    end
  end

  def destroy
    join = @job.job_interview_questions.find_by!(interview_question_id: params[:id])
    join.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Question not associated with this job" }, status: :not_found
  end

  private

  def set_job
    @job = current_user.jobs.find(params[:job_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Job not found" }, status: :not_found
  end

  def associate_existing
    question = current_user.interview_questions.find(params[:interview_question_id])

    if question.job_id.present? && question.job_id != @job.id
      return render json: { error: "This question is scoped to a different job and cannot be pinned here" }, status: :unprocessable_content
    end

    if question.organisation_id.present? && question.organisation_id != @job.organisation_id
      return render json: { error: "This question is scoped to a different organisation and cannot be pinned here" }, status: :unprocessable_content
    end

    @job.job_interview_questions.find_or_create_by!(interview_question: question)
    render json: question, status: :created
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Question not found" }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  def create_and_associate
    question = current_user.interview_questions.build(new_question_params)
    ActiveRecord::Base.transaction do
      question.save!
      @job.job_interview_questions.create!(interview_question: question)
    end
    render json: question, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  rescue ArgumentError => e
    render json: { errors: [ e.message ] }, status: :unprocessable_content
  end

  def new_question_params
    params.require(:interview_question).permit(:question, :answer, :category, :is_favourite)
  end
end
