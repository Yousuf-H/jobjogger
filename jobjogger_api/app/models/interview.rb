class Interview < ApplicationRecord
  belongs_to :job

  enum :interview_type, {
    phone_screen: 'phone_screen',
    technical: 'technical',
    panel: 'panel',
    final: 'final',
    other: 'other'
  }

  enum :format, {
    video: 'video',
    phone: 'phone',
    in_person: 'in_person'
  }

  enum :outcome, {
    pending: 'pending',
    passed: 'passed',
    failed: 'failed'
  }

  validates :scheduled_at, presence: true
  validates :interview_type, presence: true
  validates :outcome, presence: true

  scope :upcoming, -> { where('scheduled_at > ?', Time.current).order(:scheduled_at) }
  scope :past, -> { where('scheduled_at <= ?', Time.current).order(:scheduled_at) }
  scope :ordered, -> { order(:scheduled_at) }

  def debrief_available?
    scheduled_at <= Time.current
  end

  def round_number
    job.interviews.ordered.pluck(:id).index(id).to_i + 1
  end
end
