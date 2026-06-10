# frozen_string_literal: true

class AddApplicationDeadlineToJobs < ActiveRecord::Migration[8.1]
  def change
    add_column :jobs, :application_deadline, :date
  end
end
