# frozen_string_literal: true

class Api::V1::InterviewQuestionsController < Api::V1::AuthenticatedController
  before_action :set_question, only: [ :update, :destroy ]

  def index
    questions = current_user.interview_questions
    questions = questions.where(category: params[:category]) if params[:category].present?

    # Scope filter: personal, job, org
    questions = case params[:scope]
    when "job"
                  questions.for_job(current_user.jobs.find(params[:job_id])) if params[:job_id].present?
    when "org"
                  questions.for_organisation(current_user.organisations.find(params[:organisation_id])) if params[:organisation_id].present?
    when "all"
                  questions
    else
                  questions.personal
    end

    render json: questions&.order(:category, :created_at) || []
  end

  def create
    question = current_user.interview_questions.build(question_params.merge(scope_params))

    if question.save
      render json: question, status: :created
    else
      render json: { errors: question.errors.full_messages }, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resource not found" }, status: :not_found
  end

  def update
    if @question.update(question_params.merge(scope_params))
      render json: @question
    else
      render json: { errors: @question.errors.full_messages }, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resource not found" }, status: :not_found
  end

  def destroy
    @question.destroy
    head :no_content
  end

  private

  def set_question
    @question = current_user.interview_questions.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Question not found" }, status: :not_found
  end

  def question_params
    params.require(:interview_question).permit(
      :question,
      :answer,
      :category,
      :is_favourite
    )
  end

  def scope_params
    resolved = {}
    if (job_id = params.dig(:interview_question, :job_id)).present?
      resolved[:job_id] = current_user.jobs.find(job_id).id
    end
    if (organisation_id = params.dig(:interview_question, :organisation_id)).present?
      resolved[:organisation_id] = current_user.organisations.find(organisation_id).id
    end
    resolved
  end
end
