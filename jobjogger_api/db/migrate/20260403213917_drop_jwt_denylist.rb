class DropJwtDenylist < ActiveRecord::Migration[8.1]
  def change
    drop_table :jwt_denylists
  end
end
