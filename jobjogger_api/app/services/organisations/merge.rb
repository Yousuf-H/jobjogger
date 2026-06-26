# frozen_string_literal: true

module Organisations
  # Merges a duplicate organisation into a target, re-linking all associated jobs,
  # contacts, and interview questions. The duplicate's name is absorbed into the
  # target's aliases list, and any fields that are blank on the target are filled
  # in from the duplicate. The duplicate record is destroyed at the end.
  class Merge
    # @param duplicate [Organisation] the organisation to absorb and destroy
    # @param target [Organisation] the organisation to keep
    def initialize(duplicate:, target:)
      @duplicate = duplicate
      @target = target
    end

    # @return [Boolean] true on success, false when duplicate and target are the same record
    def call
      return false if @duplicate.id == @target.id

      ActiveRecord::Base.transaction do
        # Relink all associated records from duplicate to target
        @duplicate.jobs.update_all(organisation_id: @target.id)
        @duplicate.contacts.update_all(organisation_id: @target.id)
        @duplicate.interview_questions.update_all(organisation_id: @target.id)

        # Absorb the duplicate's name and aliases into target's aliases
        new_aliases = (@target.aliases + [ @duplicate.name ] + @duplicate.aliases).uniq.reject do |a|
          a.downcase == @target.name.downcase
        end

        # Fall back to the duplicate's value for any field the target has not set
        target_updates = { aliases: new_aliases }
        %i[notes rating website industry size].each do |field|
          target_updates[field] = @duplicate[field] if @target[field].blank? && @duplicate[field].present?
        end

        @target.update!(target_updates)

        @duplicate.destroy!
      end

      true
    end
  end
end
