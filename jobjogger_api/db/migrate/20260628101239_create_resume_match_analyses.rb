# frozen_string_literal: true

class CreateResumeMatchAnalyses < ActiveRecord::Migration[8.1]
  def change
    create_table :resume_match_analyses do |t|
      t.references :job, null: false, foreign_key: true, index: { unique: true }
      t.references :resume_variant, null: false, foreign_key: true
      t.string :job_description_digest, null: false
      t.integer :score, null: false
      t.jsonb :strengths, null: false, default: []
      t.jsonb :weaknesses, null: false, default: []
      t.jsonb :missing_keywords, null: false, default: []
      t.timestamps
    end
  end
end
