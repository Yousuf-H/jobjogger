class Api::V1::JobsController < ApplicationController
  def index
    jobs = apply_filters(Job.all)

    render json: jobs
  end

  def show
    job = Job.find(params[:id])

    render json: { job: job, timeline_entries: job.timeline_entries }
  end

  def create
    job = Job.new(job_params)

    if job.save
      render json: job, status: :created
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    job = Job.find(params[:id])

    if job.update(job_params)
      render json: job, status: :ok
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    job = Job.find(params[:id])
    job.destroy

    head :no_content
  end

  def archive
    job = Job.find(params[:id])
    job.archive!

    render json: job, status: :ok
  end

  def unarchive
    job = Job.find(params[:id])
    job.unarchive!

    render json: job, status: :ok
  end

  private

  def apply_filters(jobs)
    jobs = params[:archived] == "true" ? jobs.archived : jobs.active

    jobs = jobs.where(status: params[:status]) if params[:status].present?
    jobs = jobs.where(source: params[:source]) if params[:source].present?

    jobs = jobs.overdue if params[:overdue] == "true"
    jobs = jobs.due_this_week if params[:due_this_week] == "true"


    jobs = jobs.where("tags && ARRAY[?]::varchar[]", params[:tags_any]) if params[:tags_any].present?

    if params[:search].present?
      search_term = "%#{ActiveRecord::Base.sanitize_sql_like(params[:search])}%"
      jobs = jobs.where("company_name ILIKE ? OR job_title ILIKE ? OR ARRAY_TO_STRING(tags, ',') ILIKE ?",
                        search_term, search_term, search_term)
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
end
