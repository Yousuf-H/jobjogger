# frozen_string_literal: true

class AddAdminAndLastSignInToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :admin, :boolean, default: false, null: false
    add_column :users, :last_sign_in_at, :datetime
  end
end
