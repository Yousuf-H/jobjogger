class TimelineEntry < ApplicationRecord
  belongs_to :job

  enum :entry_type, {
      note: 'note',
      contact: 'contact',
      interview: 'interview',
      assessment: 'assessment',
      follow_up: 'follow_up',
      status_change: 'status_change'
    }

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
end
