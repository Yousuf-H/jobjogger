# frozen_string_literal: true

class Api::V1::OrganisationsController < Api::V1::AuthenticatedController
  before_action :set_organisation, only: [:show, :update, :destroy, :merge, :similar]

  def index
    organisations = current_user.organisations.order(:name)
    render json: organisations
  end

  def show
    render json: @organisation
  end

  def create
    organisation = current_user.organisations.build(organisation_params)

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
      render json: { error: 'Could not merge organisation' }, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Target organisation not found' }, status: :not_found
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
      render json: { errors: organisation.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @organisation.destroy
    head :no_content
  end

  private

  def set_organisation
    @organisation = current_user.organisations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Organisation not found' }, status: :not_found
  end

  def organisation_params
    params.require(:organisation).permit(:name, :website, :industry, :size, :rating, :notes, :needs_review)
  end
end