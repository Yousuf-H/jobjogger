# frozen_string_literal: true

class Api::V1::ContactsController < Api::V1::AuthenticatedController
  before_action :set_contact, only: [:show, :update, :destroy]

  def index
    contacts = current_user.contacts
                           .includes(:organisation, :jobs)
                           .order(:name)

    if params[:search].present?
      term = "%#{ActiveRecord::Base.sanitize_sql_like(params[:search])}%"
      contacts = contacts.where("contacts.name ILIKE ? OR contacts.email ILIKE ? OR contacts.role ILIKE ?", term, term, term)
    end

    if params[:organisation_id].present?
      contacts = contacts.where(organisation_id: params[:organisation_id])
    end

    render json: contacts.as_json(include: { organisation: { only: [:id, :name] }, jobs: { only: [:id, :job_title, :status] } })
  end

  def show
    render json: @contact.as_json(
      include: {
        organisation:         { only: [:id, :name] },
        jobs:                 { only: [:id, :job_title, :status, :company_name] },
        contact_interactions: { only: [:id, :interaction_type, :notes, :occurred_at] }
      }
    )
  end

  def create
    organisation = resolve_organisation

    contact = Contacts::FindOrCreate.new(
      user:         current_user,
      name:         contact_params[:name],
      organisation: organisation
    ).call

    if contact.nil?
      return render json: { errors: ["Name can't be blank"] }, status: :unprocessable_content
    end

    unless contact.update(contact_params.except(:organisation_id))
      return render json: { errors: contact.errors.full_messages }, status: :unprocessable_content
    end

    render json: contact, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  def update
    if @contact.update(contact_params)
      render json: @contact, status: :ok
    else
      render json: { errors: @contact.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @contact.destroy
    head :no_content
  end

  private

  def set_contact
    @contact = current_user.contacts.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Contact not found" }, status: :not_found
  end

  def contact_params
    params.require(:contact).permit(:name, :role, :email, :phone, :linkedin_url, :notes, :organisation_id)
  end

  def resolve_organisation
    return nil if contact_params[:organisation_id].blank?

    current_user.organisations.find_by(id: contact_params[:organisation_id])
  end
end
