# frozen_string_literal: true

module Contacts
  class Link
    def initialize(contact:, job:)
      @contact = contact
      @job     = job
    end

    def call
      return false unless @contact && @job

      ContactJob.find_or_create_by!(contact: @contact, job: @job)
      true
    rescue ActiveRecord::RecordInvalid
      false
    end
  end
end
