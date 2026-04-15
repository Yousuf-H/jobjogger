# frozen_string_literal: true

module Contacts
  class Unlink
    def initialize(contact:, job:)
      @contact = contact
      @job     = job
    end

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
