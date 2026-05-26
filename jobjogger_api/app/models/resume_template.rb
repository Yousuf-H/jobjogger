# frozen_string_literal: true

class ResumeTemplate < ApplicationRecord
  belongs_to :user
  has_many :resume_variants, dependent: :destroy
  has_one_attached :pdf

  validates :name, presence: true
end
