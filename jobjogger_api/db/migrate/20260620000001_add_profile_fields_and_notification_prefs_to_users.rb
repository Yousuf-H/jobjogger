# frozen_string_literal: true

class AddProfileFieldsAndNotificationPrefsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :phone, :string
    add_column :users, :location, :string
    add_column :users, :linkedin_url, :string
    add_column :users, :job_title, :string
    add_column :users, :notify_follow_up_reminders, :boolean, default: true, null: false
    add_column :users, :notify_interview_reminders, :boolean, default: true, null: false
  end
end
