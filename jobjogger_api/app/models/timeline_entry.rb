class TimelineEntry < ApplicationRecord
  belongs_to :job

  # Basic Validations
  validates :entry_type, presence: true
  validates :description, presence: true
  validates :occurred_at, presence: true

  # Custom validation to prevent editing status_change entries
  validate :cannot_edit_status_change, on: :update

  private

  # Prevent editing of auto-generated status change entries
  def cannot_edit_status_change
    if status_change? && (description_changed? || entry_type_changed?)
      errors.add(:base, "Cannot edit auto-generated status change entries")
    end
  end

  def status_change?
    entry_type == "status_change"
  end
end
