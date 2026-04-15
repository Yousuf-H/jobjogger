# frozen_string_literal: true

module Contacts
  class FindOrCreate
    def initialize(user:, name:, organisation: nil)
      @user         = user
      @name         = name&.strip
      @organisation = organisation
    end

    def call
      return nil if @name.blank?

      find_existing || create_new
    end

    private

    def find_existing
      scope = @user.contacts.where("LOWER(name) = LOWER(?)", @name)
      scope = scope.where(organisation: @organisation) if @organisation
      scope.first
    end

    def create_new
      @user.contacts.create!(
        name:         @name,
        organisation: @organisation
      )
    end
  end
end
