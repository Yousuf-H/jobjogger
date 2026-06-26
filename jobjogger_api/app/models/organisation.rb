# frozen_string_literal: true

# Represents a company that a user has applied to or otherwise interacts with.
# Deleting an organisation nullifies (not destroys) linked jobs, contacts, and
# interview questions — those records outlive their company reference. Organisations
# are created automatically via Organisations::FindOrCreate when a job is saved,
# so needs_review is set to true for auto-created records and false for manual ones.
class Organisation < ApplicationRecord
  belongs_to :user
  has_many :jobs, dependent: :nullify
  has_many :contacts, dependent: :nullify
  has_many :interview_questions, dependent: :nullify

  # Canonical headcount-range buckets shown in the UI. Stored as a string.
  SIZES = %w[1-10 11-50 51-200 201-1000 1000+].freeze

  # Hard cap on the aliases array to prevent runaway data from repeated merges.
  MAX_ALIASES = 50

  validates :name, presence: true
  validates :size, inclusion: { in: SIZES }, allow_nil: true
  validates :rating, numericality: { greater_than_or_equal_to: 0.1, less_than_or_equal_to: 5 }, allow_nil: true
  validates :name, uniqueness: { scope: :user_id, case_sensitive: false }
  validate :aliases_within_limit

  def rating
    self[:rating]&.to_f
  end

  def self.similar_to(name, user:, exclude_id:)
    query = user.organisations.where.not(id: exclude_id)
    name_pattern = "%#{sanitize_sql_like(name.strip)}%"
    query.where(
      "LOWER(name) LIKE LOWER(:pattern) OR LOWER(:name) LIKE LOWER('%' || name || '%') OR EXISTS (SELECT 1 FROM UNNEST(aliases) AS a WHERE LOWER(a) LIKE LOWER(:pattern) OR LOWER(:name) LIKE LOWER('%' || a || '%'))",
      pattern: name_pattern,
      name: name.strip
    )
  end

  private

  def aliases_within_limit
    errors.add(:aliases, "cannot exceed #{MAX_ALIASES} entries") if aliases.size > MAX_ALIASES
  end
end
