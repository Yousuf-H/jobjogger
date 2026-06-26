# frozen_string_literal: true

# A question in the user's interview preparation bank. Questions can be unscoped
# (personal bank), scoped to a specific job, or scoped to an organisation — but never
# both a job and an organisation at once. Separately, any question can be *pinned* to
# one or more jobs via JobInterviewQuestion; this is distinct from its scope.
#
# Re-scoping a question is validated against existing pins to prevent conflicts:
# you cannot scope a question to job A if it is already pinned to job B.
class InterviewQuestion < ApplicationRecord
  belongs_to :user
  belongs_to :job, optional: true
  belongs_to :organisation, optional: true
  has_many :job_interview_questions, dependent: :destroy

  enum :category, {
    behavioural:      "behavioural",      # soft-skills, situational, STAR-format questions
    technical:        "technical",        # coding, architecture, domain-knowledge questions
    questions_to_ask: "questions_to_ask"  # questions the user wants to ask the interviewer
  }

  validates :question, presence: true
  validates :category, presence: true
  validate :single_scope
  validate :scope_compatible_with_existing_pins, on: :update

  scope :personal, -> { where(job_id: nil, organisation_id: nil) }
  scope :for_job, ->(job) { where(job: job) }
  scope :for_organisation, ->(org) { where(organisation: org, job_id: nil) }
  scope :favourites, -> { where(is_favourite: true) }

  private

  def single_scope
    if job_id.present? && organisation_id.present?
      errors.add(:base, "A question can only be scoped to a job or an organisation, not both")
    end
  end

  def scope_compatible_with_existing_pins
    return unless job_id_changed? || organisation_id_changed?

    if job_id.present?
      if job_interview_questions.where.not(job_id: job_id).exists?
        errors.add(:base, "Cannot scope this question to a job while it is pinned to other jobs")
      end
    end

    if organisation_id.present?
      conflicting = job_interview_questions.joins(:job)
        .where("jobs.organisation_id != ? OR jobs.organisation_id IS NULL", organisation_id)
      errors.add(:base, "Cannot scope this question to an organisation while it is pinned to jobs in other organisations") if conflicting.exists?
    end
  end
end
