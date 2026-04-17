# frozen_string_literal: true

class Api::V1::ContactInteractionsController < Api::V1::AuthenticatedController
  before_action :set_contact

  def create
    interaction = @contact.contact_interactions.build(interaction_params)

    if interaction.save
      render json: interaction, status: :created
    else
      render json: { errors: interaction.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    interaction = @contact.contact_interactions.find(params[:id])
    interaction.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Interaction not found" }, status: :not_found
  end

  private

  def set_contact
    @contact = current_user.contacts.find(params[:contact_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Contact not found" }, status: :not_found
  end

  def interaction_params
    params.require(:contact_interaction).permit(:interaction_type, :notes, :occurred_at)
  end
end
