# frozen_string_literal: true

class Api::V1::JobsController < Api::V1::AuthenticatedController
  before_action :set_job, only: [:show, :update, :destroy, :archive, :unarchive]
  before_action :check_demo_job_limit, only: [:create]

  def index
    jobs = apply_filters(current_user.jobs.includes(:interviews))

    render json: jobs
  end

  def show
    render json: { job: @job, timeline_entries: @job.timeline_entries }
  end

  def create
    job = current_user.jobs.build(job_params)

    if job.follow_up_date.blank?
      base_date = job.date_applied.presence || Date.current
      job.follow_up_date = base_date + current_user.default_follow_up_days.days
    end

    ActiveRecord::Base.transaction do
      organisation = Organisations::FindOrCreate.new(
        user: current_user,
        company_name: params.dig(:job, :company_name)
      ).call
      job.organisation = organisation

      unless job.save
        raise ActiveRecord::Rollback
      end
    end

    if job.persisted?
      render json: job, status: :created
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_content
    end
  rescue ArgumentError => e
    render json: { errors: [e.message] }, status: :unprocessable_content
  end

  def update
    updates = job_params.to_h.with_indifferent_access
    job_updated = false

    ActiveRecord::Base.transaction do
      if updates[:company_name].present? && updates[:company_name] != @job.company_name
        org = Organisations::FindOrCreate.new(
          user: current_user,
          company_name: updates[:company_name]
        ).call
        updates[:organisation_id] = org&.id
      elsif updates.key?(:organisation_id) && updates[:organisation_id].present?
        # TODO: can be removed after model validation confirmed in prod
        # Job#organisation_belongs_to_user now validates this at the model layer.
        unless current_user.organisations.exists?(updates[:organisation_id])
          return render json: { errors: ['Organisation not found'] }, status: :not_found
        end
      end

      raw = params.fetch(:job, {})
      if raw.key?(:resume_variant_id) || raw.key?("resume_variant_id")
        variant_id = raw[:resume_variant_id]
        if variant_id.present?
          # TODO: can be removed after model validation confirmed in prod
          # Job#resume_variant_belongs_to_user now validates this at the model layer.
          unless current_user.resume_variants.exists?(variant_id)
            return render json: { errors: ['Resume variant not found'] }, status: :not_found
          end
          updates[:resume_variant_id] = variant_id
        else
          updates[:resume_variant_id] = nil
        end
      end

      job_updated = @job.update(updates)
      raise ActiveRecord::Rollback unless job_updated
    end

    if job_updated
      render json: @job, status: :ok
    else
      render json: { errors: @job.errors.full_messages }, status: :unprocessable_content
    end
  rescue ArgumentError => e
    render json: { errors: [e.message] }, status: :unprocessable_content
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

    if params[:job_url].present?
      jobs = jobs.where(job_url: params[:job_url])
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
      jobs = jobs.order(Arel.sql("follow_up_date ASC NULLS LAST, updated_at DESC"))
    end

    jobs
  end

  def job_params
    params.require(:job).permit(:company_name, :job_title, :status, :job_url, :source, :source_other, :date_applied, :follow_up_date, :application_deadline, :priority, :notes, :location, :employment_type, :salary_range, :job_description, :organisation_id, tags: [])
  end

  def check_demo_job_limit
    return unless current_user.demo?

    if current_user.jobs.count >= 20
      render json: { status: { message: "Demo account is limited to 20 jobs." } },
            status: :forbidden
    end
  end
end