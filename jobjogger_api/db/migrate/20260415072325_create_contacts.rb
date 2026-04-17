# frozen_string_literal: true

class CreateContacts < ActiveRecord::Migration[8.1]
  def change
    create_table :contacts do |t|
      t.references :user,         null: false, foreign_key: true
      t.references :organisation, null: true,  foreign_key: true
      t.string  :name,            null: false
      t.string  :role
      t.string  :email
      t.string  :phone
      t.string  :linkedin_url
      t.text    :notes

      t.timestamps
    end

    add_index :contacts, [ :user_id, :name ]
  end
end
