# frozen_string_literal: true

module Contacts
  # Removes the link between a contact and a job. If the contact becomes
  # completely orphaned after unlinking (no organisation, no remaining jobs,
  # no interactions), it is destroyed automatically.
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

      # Clean up the contact if it has no org, no remaining jobs, and no interactions
      if @contact.organisation_id.nil? &&
         @contact.jobs.empty? &&
         @contact.contact_interactions.empty?
        @contact.destroy
      end

      true
    end
  end
end
