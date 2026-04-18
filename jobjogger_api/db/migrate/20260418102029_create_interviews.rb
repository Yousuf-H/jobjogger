class CreateInterviews < ActiveRecord::Migration[8.1]
  def change
    create_table :interviews do |t|
      t.references :job, null: false, foreign_key: true
      t.datetime :scheduled_at, null: false
      t.string :interview_type, null: false
      t.string :format
      t.string :location_or_link
      t.text :prep_notes
      t.text :debrief_notes
      t.string :outcome, null: false, default: 'pending'

      t.timestamps
    end

    add_index :interviews, [:job_id, :scheduled_at]
  end
end
