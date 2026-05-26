# frozen_string_literal: true

class CreateResumeTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :resume_templates do |t|
      t.references :user, null: false, foreign_key: true
      t.string     :name,  null: false
      t.text       :notes

      t.timestamps
    end
  end
end
