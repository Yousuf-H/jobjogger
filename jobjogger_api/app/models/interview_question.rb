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

  private

  def single_scope
    if job_id.present? && organisation_id.present?
      errors.add(:base, "A question can only be scoped to a job or an organisation, not both")
    end
  end

  scope :personal, -> { where(job_id: nil, organisation_id: nil) }
  scope :for_job, ->(job) { where(job: job) }
  scope :for_organisation, ->(org) { where(organisation: org, job_id: nil) }
  scope :favourites, -> { where(is_favourite: true) }
end
