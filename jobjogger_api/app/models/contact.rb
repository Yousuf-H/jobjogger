# frozen_string_literal: true

# Represents a person in the user's professional network. Contacts can be linked
# to one organisation and to multiple jobs. Deleting a contact destroys its job
# links and interaction history; the contact itself is only removed explicitly.
class Contact < ApplicationRecord
  belongs_to :user
  belongs_to :organisation, optional: true
  has_many :contact_jobs, dependent: :destroy
  has_many :jobs, through: :contact_jobs
  has_many :contact_interactions, dependent: :destroy

  # Permitted interaction types for ContactInteraction records, kept here so both
  # the Contact and ContactInteraction models share a single source of truth.
  INTERACTION_TYPES = %w[email call coffee_chat linkedin interview other].freeze

  validates :name, presence: true
  validate :organisation_belongs_to_user

  private

  def organisation_belongs_to_user
    return if organisation_id.blank?
    return if organisation&.user_id == user_id

    errors.add(:organisation, "not found")
  end
end
