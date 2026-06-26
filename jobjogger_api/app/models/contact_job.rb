# frozen_string_literal: true

# Join table linking contacts to jobs (many-to-many). Each contact-job pair must
# be unique; the uniqueness constraint is enforced at both the DB and model levels.
# Managed via Contacts::Link and Contacts::Unlink service objects — do not create
# or destroy these records directly.
class ContactJob < ApplicationRecord
  belongs_to :contact
  belongs_to :job

  validates :contact_id, uniqueness: { scope: :job_id }
end
