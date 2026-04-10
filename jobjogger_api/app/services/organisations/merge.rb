# frozen_string_literal: true

module Organisations
  class Merge
    def initialize(duplicate:, target:)
      @duplicate = duplicate
      @target = target
    end

    def call
      return false if @duplicate.id == @target.id

      ActiveRecord::Base.transaction do
        # Relink all jobs from duplicate to target
        @duplicate.jobs.update_all(organisation_id: @target.id)

        # Absorb the duplicate's name and aliases into target's aliases
        new_aliases = (@target.aliases + [@duplicate.name] + @duplicate.aliases).uniq.reject do |a|
          a.downcase == @target.name.downcase
        end

        @target.update!(aliases: new_aliases)

        @duplicate.destroy!
      end

      true
    end
  end
end