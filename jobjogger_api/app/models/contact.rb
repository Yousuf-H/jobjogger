# frozen_string_literal: true

class Contact < ApplicationRecord
  belongs_to :user
  belongs_to :organisation, optional: true
  has_many :contact_jobs, dependent: :destroy
  has_many :jobs, through: :contact_jobs
  has_many :contact_interactions, dependent: :destroy

  INTERACTION_TYPES = %w[email call coffee_chat linkedin interview other].freeze

  validates :name, presence: true
  validate :organisation_belongs_to_user

  private

  def organisation_belongs_to_user
    return if organisation_id.blank?
    return unless organisation
    return if organisation.user_id == user_id

    errors.add(:organisation, "does not belong to this user")
  end
end
