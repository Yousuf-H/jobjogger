# frozen_string_literal: true

# Records a single touchpoint between the user and a contact (e.g. a call, email,
# or coffee chat). Belongs exclusively to a Contact and is destroyed with it.
# interaction_type must be one of Contact::INTERACTION_TYPES.
class ContactInteraction < ApplicationRecord
  belongs_to :contact

  validates :interaction_type, presence: true, inclusion: { in: Contact::INTERACTION_TYPES }
  validates :occurred_at, presence: true
end
