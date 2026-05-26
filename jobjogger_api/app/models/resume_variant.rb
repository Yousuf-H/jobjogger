# frozen_string_literal: true

class ResumeVariant < ApplicationRecord
  belongs_to :resume_template
  belongs_to :user
  has_one_attached :pdf
  # has_many :jobs added in the same commit that adds resume_variant_id to jobs
end
