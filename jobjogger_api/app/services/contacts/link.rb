# frozen_string_literal: true

module Contacts
  # Links a contact to a job by creating a ContactJob join record. Idempotent —
  # calling it when the link already exists is safe and returns true.
  class Link
    # @param contact [Contact]
    # @param job [Job]
    def initialize(contact:, job:)
      @contact = contact
      @job     = job
    end

    # @return [Boolean] true on success, false when contact or job is nil or the link cannot be created
    def call
      return false unless @contact && @job

      ContactJob.find_or_create_by!(contact: @contact, job: @job)
      true
    rescue ActiveRecord::RecordInvalid
      false
    end
  end
end
