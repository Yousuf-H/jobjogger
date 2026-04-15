# frozen_string_literal: true

class Api::V1::JobContactsController < Api::V1::AuthenticatedController
  before_action :set_job

  def index
    render json: @job.contacts.includes(:organisation).as_json(
      include: { organisation: { only: [:id, :name] } }
    )
  end

  def create
    contact = current_user.contacts.find_by(id: params[:contact_id])

    unless contact
      return render json: { error: "Contact not found" }, status: :not_found
    end

    if Contacts::Link.new(contact: contact, job: @job).call
      render json: contact, status: :ok
    else
      render json: { error: "Could not link contact to job" }, status: :unprocessable_content
    end
  end

  def destroy
    contact = current_user.contacts.find_by(id: params[:id])

    unless contact
      return render json: { error: "Contact not found" }, status: :not_found
    end

    if Contacts::Unlink.new(contact: contact, job: @job).call
      head :no_content
    else
      render json: { error: "Contact is not linked to this job" }, status: :unprocessable_content
    end
  end

  private

  def set_job
    @job = current_user.jobs.find(params[:job_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Job not found" }, status: :not_found
  end
end
