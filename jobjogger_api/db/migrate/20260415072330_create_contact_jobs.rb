# frozen_string_literal: true

class CreateContactJobs < ActiveRecord::Migration[8.1]
  def change
    create_table :contact_jobs do |t|
      t.references :contact, null: false, foreign_key: true
      t.references :job,     null: false, foreign_key: true

      t.timestamps
    end

    add_index :contact_jobs, [ :contact_id, :job_id ], unique: true
  end
end
