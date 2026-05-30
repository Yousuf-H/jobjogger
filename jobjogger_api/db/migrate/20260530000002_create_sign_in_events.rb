class CreateSignInEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :sign_in_events do |t|
      t.references :user, null: false, foreign_key: true
      t.datetime :created_at, null: false
    end

    add_index :sign_in_events, :created_at
  end
end
