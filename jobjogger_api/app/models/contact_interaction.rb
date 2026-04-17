# frozen_string_literal: true

class ContactInteraction < ApplicationRecord
  belongs_to :contact

  validates :interaction_type, presence: true, inclusion: { in: Contact::INTERACTION_TYPES }
  validates :occurred_at, presence: true
end
