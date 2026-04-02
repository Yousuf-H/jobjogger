# frozen_string_literal: true

class Api::V1::JobsController < Api::V1::AuthenticatedController
  before_action :set_job, only: [:show, :update, :destroy, :archive, :unarchive]
  before_action :check_demo_job_limit, only: [:create]

  def index
    jobs = apply_filters(current_user.jobs)

    render json: jobs
  end

  def show
    render json: { job: @job, timeline_entries: @job.timeline_entries }
  end

  def create
    job = current_user.jobs.build(job_params)

    if job.save
      render json: job, status: :created
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_content
    end
  rescue ArgumentError => e
    render json: { errors: [e.message] }, status: :unprocessable_content
  end

  def update
    if @job.update(job_params)
      render json: @job, status: :ok
    else
      render json: { errors: @job.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @job.destroy
    head :no_content
  end

  def archive
    @job.archive!
    render json: @job, status: :ok
  end

  def unarchive
    @job.unarchive!
    render json: @job, status: :ok
  end

  private

  def set_job
    @job = current_user.jobs.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Job not found' }, status: :not_found
  end

  def apply_filters(jobs)
    if params[:archived] == "true"
      jobs = jobs.archived
    elsif params[:status].present?
      jobs = jobs.where(archived_at: nil)
    else
      jobs = jobs.active
    end

    if params[:status].present?
      statuses = Array(params[:status])
      jobs = jobs.where(status: statuses)
    end

    if params[:priority].present?
      priorities = Array(params[:priority])
      jobs = jobs.where(priority: priorities)
    end

    if params[:source].present?
      sources = Array(params[:source])
      jobs = jobs.where(source: sources)
    end

    jobs = jobs.overdue if params[:overdue] == "true"
    jobs = jobs.due_this_week if params[:due_this_week] == "true"

    jobs = jobs.where("tags && ARRAY[?]::varchar[]", params[:tags_any]) if params[:tags_any].present?

    if params[:search].present?
      search_term = "%#{ActiveRecord::Base.sanitize_sql_like(params[:search])}%"
      jobs = jobs.where(
        "company_name ILIKE ? OR job_title ILIKE ? OR ARRAY_TO_STRING(tags, ',') ILIKE ?",
        search_term, search_term, search_term
      )
    end

    if ["created_at", "date_applied", "follow_up_date", "priority"].include?(params[:sort])
      direction = params[:direction] == "desc" ? "desc" : "asc"
      jobs = jobs.order("#{params[:sort]} #{direction}")
    else
      jobs = jobs.order("follow_up_date ASC NULLS LAST, created_at DESC")
    end

    jobs
  end

  def job_params
    params.require(:job).permit(:company_name, :job_title, :status, :job_url, :source, :source_other, :date_applied, :follow_up_date, :priority, :notes, :location, :employment_type, :salary_range, :job_description, tags: [])
  end

  def check_demo_job_limit
    return unless current_user.demo?

    if current_user.jobs.count >= 20
      render json: { status: { message: "Demo account is limited to 20 jobs." } },
            status: :forbidden
    end
  end
end