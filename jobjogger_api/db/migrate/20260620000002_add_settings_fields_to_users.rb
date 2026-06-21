# frozen_string_literal: true

class AddSettingsFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :theme, :string, default: "system", null: false
    add_column :users, :notify_stage_stall, :boolean, default: true, null: false
    add_column :users, :notify_deadline_reminder, :boolean, default: true, null: false
    add_column :users, :default_follow_up_days, :integer, default: 7, null: false
  end
end
