# frozen_string_literal: true

class CreateResumeVariants < ActiveRecord::Migration[8.0]
  def change
    create_table :resume_variants do |t|
      t.references :resume_template, null: false, foreign_key: true
      t.references :user,            null: false, foreign_key: true
      t.text       :notes

      t.timestamps
    end
  end
end
