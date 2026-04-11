# frozen_string_literal: true

class Api::V1::OrganisationsController < Api::V1::AuthenticatedController
  before_action :set_organisation, only: [ :show, :update, :destroy, :merge, :similar, :dismiss_review ]
  before_action :check_demo_org_limit, only: [ :create ]

  def index
    organisations = current_user.organisations
      .left_joins(:jobs)
      .select(
        "organisations.*",
        "COUNT(jobs.id) AS total_jobs_count",
        "SUM(CASE WHEN jobs.archived_at IS NULL AND jobs.status NOT IN ('accepted','rejected','ghosted','withdrawn') THEN 1 ELSE 0 END) AS active_jobs_count"
      )
      .group("organisations.id")
      .order(:name)
    render json: organisations
  end

  def show
    render json: @organisation.as_json(include: { jobs: { only: [ :id, :job_title, :status, :archived_at ] } })
  end

  def create
    organisation = current_user.organisations.build(organisation_params)
    organisation.needs_review = false

    if organisation.save
      render json: organisation, status: :created
    else
      render json: { errors: organisation.errors.full_messages }, status: :unprocessable_content
    end
  end

  def merge
    target = current_user.organisations.find(params[:target_id])
    result = Organisations::Merge.new(duplicate: @organisation, target: target).call

    if result
      render json: target, status: :ok
    else
      render json: { error: "Could not merge organisation" }, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Target organisation not found" }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  def similar
    suggestions = Organisation.similar_to(
      @organisation.name,
      user: current_user,
      exclude_id: @organisation.id
    )

    render json: suggestions
  end

  def update
    if @organisation.update(organisation_params)
      render json: @organisation, status: :ok
    else
      render json: { errors: @organisation.errors.full_messages }, status: :unprocessable_content
    end
  end

  def dismiss_review
    @organisation.update!(needs_review: false)
    render json: @organisation, status: :ok
  end

  def destroy
    @organisation.destroy
    head :no_content
  end

  private

  def set_organisation
    @organisation = current_user.organisations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Organisation not found" }, status: :not_found
  end

  def organisation_params
    params.require(:organisation).permit(:name, :website, :industry, :size, :rating, :notes)
  end

  def check_demo_org_limit
    return unless current_user.demo?

    if current_user.organisations.count >= 20
      render json: { status: { message: "Demo account is limited to 20 organisations." } },
             status: :forbidden
    end
  end
end
