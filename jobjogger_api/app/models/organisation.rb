# frozen_string_literal: true

class Organisation < ApplicationRecord
  belongs_to :user
  has_many :jobs, dependent: :nullify
  has_many :interview_questions, dependent: :nullify

  SIZES = %w[1-10 11-50 51-200 201-1000 1000+].freeze

  validates :name, presence: true
  validates :size, inclusion: { in: SIZES }, allow_nil: true
  validates :rating, numericality: { greater_than_or_equal_to: 0.1, less_than_or_equal_to: 5 }, allow_nil: true
  validates :name, uniqueness: { scope: :user_id, case_sensitive: false }
  validate :aliases_within_limit

  MAX_ALIASES = 50

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
