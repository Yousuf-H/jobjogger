# frozen_string_literal: true

class CreateContactInteractions < ActiveRecord::Migration[8.1]
  def change
    create_table :contact_interactions do |t|
      t.references :contact,          null: false, foreign_key: true
      t.string     :interaction_type, null: false
      t.text       :notes
      t.datetime   :occurred_at,      null: false

      t.timestamps
    end
  end
end
