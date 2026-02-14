class CreateTimelineEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :timeline_entries do |t|
      # Foreign key to jobs table
      t.references :job, null: false, foreign_key: true

      # Required fields
      t.string :entry_type, null: false
      t.text :description, null: false
      t.datetime :occurred_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }

      # Optional metadata
      t.jsonb :metadata

      t.timestamps
    end

    add_index :timeline_entries, [:job_id, :occurred_at], order: { occurred_at: :desc }
  end
end
