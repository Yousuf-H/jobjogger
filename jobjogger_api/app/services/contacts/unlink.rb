# frozen_string_literal: true

module Contacts
  # Removes the link between a contact and a job. Only the ContactJob join record
  # is removed — the contact itself is never auto-deleted. Contacts represent real
  # people and their data has value independent of any job link; removal must be
  # explicit from the contacts page.
  class Unlink
    # @param contact [Contact]
    # @param job [Job]
    def initialize(contact:, job:)
      @contact = contact
      @job     = job
    end

    # @return [Boolean] true when the link was found and removed, false when no link existed
    def call
      contact_job = ContactJob.find_by(contact: @contact, job: @job)
      return false unless contact_job

      contact_job.destroy
      true
    end
  end
end
