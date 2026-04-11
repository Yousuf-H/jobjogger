class AddUniqueIndexToOrganisationsUserIdName < ActiveRecord::Migration[8.1]
  def change
    remove_index :organisations, [:user_id, :name]
    add_index :organisations, [:user_id, :name], unique: true
  end
end
