class CreateJobs < ActiveRecord::Migration[8.1]
  def change
    create_table :jobs do |t|
      # Required fields
      t.string :company_name, null: false
      t.string :job_title, null: false
      t.string :status, null: false

      # Optional core fields
      t.string :location
      t.string :employment_type
      t.string :salary_range
      t.string :source
      t.string :source_other
      t.text :job_url
      t.text :job_description
      t.string :priority

      # Action tracking fields
      t.string :next_action
      t.date :follow_up_date

      # Notes and tags
      t.text :notes
      t.string :tags, array: true, default: []

      # Dates
      t.date :date_applied
      t.datetime :archived_at

      t.timestamps
    end

    add_index :jobs, :company_name
    add_index :jobs, :job_title
    add_index :jobs, :status
    add_index :jobs, :follow_up_date
    add_index :jobs, :archived_at
    add_index :jobs, :tags, using: 'gin'
    add_index :jobs, [:status, :follow_up_date]
  end
end
