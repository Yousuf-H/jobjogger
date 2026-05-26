# frozen_string_literal: true

class ResumeVariant < ApplicationRecord
  belongs_to :resume_template
  belongs_to :user
  has_many :jobs, foreign_key: :resume_variant_id, dependent: :nullify, inverse_of: :resume_variant
  has_one_attached :pdf
end
