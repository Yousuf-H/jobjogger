# frozen_string_literal: true

class AddResumeVariantToJobs < ActiveRecord::Migration[8.0]
  def change
    add_reference :jobs, :resume_variant, null: true, foreign_key: true
  end
end
