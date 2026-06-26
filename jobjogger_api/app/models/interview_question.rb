# frozen_string_literal: true

class InterviewQuestion < ApplicationRecord
  belongs_to :user
  belongs_to :job, optional: true
  belongs_to :organisation, optional: true
  has_many :job_interview_questions, dependent: :destroy

  enum :category, {
    behavioural: "behavioural",
    technical: "technical",
    questions_to_ask: "questions_to_ask"
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
