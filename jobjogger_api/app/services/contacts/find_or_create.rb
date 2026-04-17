# frozen_string_literal: true

module Contacts
  class FindOrCreate
    def initialize(user:, name:, organisation: nil, extra_attributes: {})
      @user             = user
      @name             = name&.strip
      @organisation     = organisation
      @extra_attributes = extra_attributes
    end

    def call
      return nil if @name.blank?

      find_existing || create_new
    end

    private

    def find_existing
      scope = @user.contacts.where("LOWER(name) = LOWER(?)", @name)
      # Match on organisation presence so two contacts with the same name
      # at different orgs (or one with/without an org) are treated as distinct.
      scope = if @organisation
                scope.where(organisation: @organisation)
      else
                scope.where(organisation_id: nil)
      end
      scope.first
    end

    def create_new
      @user.contacts.create!(
        name:         @name,
        organisation: @organisation,
        **@extra_attributes
      )
    end
  end
end
