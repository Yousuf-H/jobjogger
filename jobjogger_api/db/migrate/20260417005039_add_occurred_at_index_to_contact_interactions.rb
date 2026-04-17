# frozen_string_literal: true

class AddOccurredAtIndexToContactInteractions < ActiveRecord::Migration[8.1]
  def change
    add_index :contact_interactions, :occurred_at
  end
end
