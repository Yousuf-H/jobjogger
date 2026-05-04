# frozen_string_literal: true

class JobInterviewQuestion < ApplicationRecord
  belongs_to :job
  belongs_to :interview_question

  validates :interview_question_id, uniqueness: { scope: :job_id }
end
