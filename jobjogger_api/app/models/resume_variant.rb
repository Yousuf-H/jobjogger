# frozen_string_literal: true

class ResumeVariant < ApplicationRecord
  belongs_to :resume_template
  belongs_to :user
  has_many :jobs, foreign_key: :resume_variant_id, dependent: :nullify, inverse_of: :resume_variant
  has_one_attached :pdf

  validate :user_matches_template_user

  private

  def user_matches_template_user
    return unless resume_template
    return if resume_template.user_id == user_id

    errors.add(:user, "must match the resume template's owner")
  end
end
