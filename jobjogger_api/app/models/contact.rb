# frozen_string_literal: true

class Contact < ApplicationRecord
  belongs_to :user
  belongs_to :organisation, optional: true
  has_many :contact_jobs, dependent: :destroy
  has_many :jobs, through: :contact_jobs
  has_many :contact_interactions, dependent: :destroy

  INTERACTION_TYPES = %w[email call coffee_chat linkedin interview other].freeze

  validates :name, presence: true
end
