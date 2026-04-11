# frozen_string_literal: true

module Organisations
  class FindOrCreate
    def initialize(user:, company_name:)
      @user = user
      @company_name = company_name&.strip
    end

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
      @user.organisations.create!(
        name: @company_name,
        needs_review: true
      )
    end
  end
end