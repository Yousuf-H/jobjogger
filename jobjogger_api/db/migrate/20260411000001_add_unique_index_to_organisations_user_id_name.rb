class AddUniqueIndexToOrganisationsUserIdName < ActiveRecord::Migration[8.1]
  def up
    remove_index :organisations, [:user_id, :name], if_exists: true
    execute <<~SQL
      CREATE UNIQUE INDEX index_organisations_on_user_id_and_lower_name
      ON organisations (user_id, LOWER(name));
    SQL
  end

  def down
    execute "DROP INDEX IF EXISTS index_organisations_on_user_id_and_lower_name"
    add_index :organisations, [:user_id, :name], name: "index_organisations_on_user_id_and_name", if_not_exists: true
  end
end