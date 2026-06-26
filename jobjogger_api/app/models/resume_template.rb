# frozen_string_literal: true

# A named resume template belonging to a user, optionally backed by a PDF file.
# Templates are the parent record — each variant is a specific version (tailored copy)
# of the template. Deleting a template cascades to all its variants.
class ResumeTemplate < ApplicationRecord
  belongs_to :user
  has_many :resume_variants, dependent: :destroy
  has_one_attached :pdf

  validates :name, presence: true
end
