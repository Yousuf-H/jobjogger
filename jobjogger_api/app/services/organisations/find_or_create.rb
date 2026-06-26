# frozen_string_literal: true

module Organisations
  # Looks up an existing organisation for the user by name (case-insensitive) or
  # alias, and creates one if no match is found. Handles concurrent inserts by
  # rescuing RecordNotUnique and retrying the lookup.
  class FindOrCreate
    # @param user [User]
    # @param company_name [String, nil]
    def initialize(user:, company_name:)
      @user = user
      @company_name = company_name&.strip
    end

    # @return [Organisation, nil] nil when company_name is blank
    # @raise [ArgumentError] when the demo user has reached the 20-organisation limit
    def call
      return nil if @company_name.blank?

      find_by_name || find_by_alias || create_new
    rescue ActiveRecord::RecordNotUnique
      # A concurrent request created the same org between our find and create.
      # Retry the lookup to return the existing record.
      find_by_name || find_by_alias
    end

    private

    def find_by_name
      @user.organisations.find_by("LOWER(name) = LOWER(?)", @company_name)
    end

    def find_by_alias
      @user.organisations.find_by("LOWER(?) = ANY(SELECT LOWER(a) FROM UNNEST(aliases) AS a)", @company_name)
    end

    def create_new
      if @user.demo? && @user.organisations.count >= 20
        raise ArgumentError, "Demo account is limited to 20 organisations."
      end

      @user.organisations.create!(
        name: @company_name,
        needs_review: true
      )
    end
  end
end
