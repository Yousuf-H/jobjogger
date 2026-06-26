# frozen_string_literal: true

module Contacts
  # Looks up an existing contact for the user by name (case-insensitive) scoped
  # to the given organisation, and creates one if no match is found. Two contacts
  # with the same name at different organisations are treated as distinct people.
  class FindOrCreate
    # @param user [User]
    # @param name [String, nil]
    # @param organisation [Organisation, nil]
    # @param extra_attributes [Hash] additional attributes to set on create (e.g. role, email)
    def initialize(user:, name:, organisation: nil, extra_attributes: {})
      @user             = user
      @name             = name&.strip
      @organisation     = organisation
      @extra_attributes = extra_attributes
    end

    # @return [Contact, nil] nil when name is blank
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
