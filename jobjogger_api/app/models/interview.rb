# frozen_string_literal: true

# Represents a single scheduled interview for a job. Belongs to the job (not the user
# directly) and is destroyed when the job is deleted. debrief_available? gates whether
# the user can fill in outcome notes — it becomes true once scheduled_at has passed.
class Interview < ApplicationRecord
  belongs_to :job

  enum :interview_type, {
    phone_screen: "phone_screen", # initial recruiter screen
    technical:    "technical",    # coding challenge, system design, or skills assessment
    panel:        "panel",        # multiple interviewers at once
    final:        "final",        # executive or offer-stage interview
    other:        "other"
  }

  enum :format, {
    video:     "video",     # Zoom, Teams, Google Meet, etc.
    phone:     "phone",     # audio call only
    in_person: "in_person"  # on-site
  }

  enum :outcome, {
    pending: "pending", # interview has not yet taken place or result is unknown
    passed:  "passed",  # user progressed to the next stage
    failed:  "failed"   # user did not progress
  }

  validates :scheduled_at, presence: true
  validates :interview_type, presence: true
  validates :outcome, presence: true

  scope :upcoming, -> { where("scheduled_at > ?", Time.current).order(:scheduled_at) }
  scope :past, -> { where("scheduled_at <= ?", Time.current).order(:scheduled_at) }
  scope :ordered, -> { order(:scheduled_at) }

  def debrief_available?
    scheduled_at <= Time.current
  end
end
