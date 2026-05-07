# frozen_string_literal: true

class Api::V1::InterviewQuestionsController < Api::V1::AuthenticatedController
  before_action :set_question, only: [ :update, :destroy ]

  def index
    questions = current_user.interview_questions
    questions = questions.where(category: params[:category]) if params[:category].present?

    # Scope filter: personal, job, org
    questions = case params[:scope]
    when "job"
      params[:job_id].present? ? questions.for_job(current_user.jobs.find(params[:job_id])) : questions.none
    when "org"
      params[:organisation_id].present? ? questions.for_organisation(current_user.organisations.find(params[:organisation_id])) : questions.none
    when "all"
      questions
    else
      questions.personal
    end

    render json: questions.order(:category, :created_at)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resource not found" }, status: :not_found
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
  rescue ArgumentError => e
    render json: { errors: [ e.message ] }, status: :unprocessable_content
  end

  def update
    new_scope = scope_params

    if new_scope[:job_id].present?
      if @question.job_interview_questions.where.not(job_id: new_scope[:job_id]).exists?
        return render json: { error: "Cannot scope this question to a job while it is pinned to other jobs" }, status: :unprocessable_content
      end
    end

    if new_scope[:organisation_id].present?
      conflicting = @question.job_interview_questions.joins(:job)
        .where("jobs.organisation_id != ? OR jobs.organisation_id IS NULL", new_scope[:organisation_id])
        
      if conflicting.exists?
        return render json: { error: "Cannot scope this question to an organisation while it is pinned to jobs in other organisations" }, status: :unprocessable_content
      end
    end

    if @question.update(question_params.merge(new_scope))
      render json: @question
    else
      render json: { errors: @question.errors.full_messages }, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resource not found" }, status: :not_found
  rescue ArgumentError => e
    render json: { errors: [ e.message ] }, status: :unprocessable_content
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
    question_params_raw = params[:interview_question]
    return resolved unless question_params_raw

    if question_params_raw.key?(:job_id)
      job_id = question_params_raw[:job_id]
      resolved[:job_id] = job_id.present? ? current_user.jobs.find(job_id).id : nil
    end

    if question_params_raw.key?(:organisation_id)
      organisation_id = question_params_raw[:organisation_id]
      resolved[:organisation_id] = organisation_id.present? ? current_user.organisations.find(organisation_id).id : nil
    end

    resolved
  end
end
