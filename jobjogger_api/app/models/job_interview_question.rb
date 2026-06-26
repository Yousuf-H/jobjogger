# frozen_string_literal: true

class JobInterviewQuestion < ApplicationRecord
  belongs_to :job
  belongs_to :interview_question

  validates :interview_question_id, uniqueness: { scope: :job_id }
  validate :question_scope_compatible_with_job

  private

  def question_scope_compatible_with_job
    return unless interview_question && job

    if interview_question.job_id.present? && interview_question.job_id != job_id
      errors.add(:interview_question, "is scoped to a different job and cannot be pinned here")
    end

    if interview_question.organisation_id.present? && interview_question.organisation_id != job.organisation_id
      errors.add(:interview_question, "is scoped to a different organisation and cannot be pinned here")
    end
  end
end
