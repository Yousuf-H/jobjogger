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

  validates :entry_type, presence: true
  validates :description, presence: true
  validates :occurred_at, presence: true

  validate :cannot_edit_status_change, on: :update

  private

  def cannot_edit_status_change
    if status_change? && (description_changed? || entry_type_changed?)
      errors.add(:base, "Cannot edit auto-generated status change entries")
    end
  end
end
