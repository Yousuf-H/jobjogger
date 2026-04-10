class CreateOrganisations < ActiveRecord::Migration[8.1]
  def change
    create_table :organisations do |t|
      t.string :name, null: false
      t.string :website
      t.string :industry
      t.string :size
      t.integer :rating
      t.text :notes
      t.string :aliases, default: [], array: true
      t.boolean :needs_review, null: false, default: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :organisations, [:user_id, :name]
  end
end