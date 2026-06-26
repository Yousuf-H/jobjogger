# frozen_string_literal: true

# A specific version of a resume template, tailored for a particular role or company.
# Belongs to both a ResumeTemplate and a User; the user must match the template's owner
# (enforced by user_matches_template_user). Variants can be linked to jobs to track
# which version of a resume was sent for each application.
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
