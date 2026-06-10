# frozen_string_literal: true

class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :job,  null: true,  foreign_key: true
      t.integer    :kind, null: false
      t.string     :body, null: false
      t.datetime   :read_at

      t.timestamps
    end

    add_index :notifications, [ :user_id, :read_at ]
    add_index :notifications, [ :job_id, :kind, :created_at ]
  end
end
