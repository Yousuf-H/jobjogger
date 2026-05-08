class ChangeContactsOrganisationFkToNullify < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :contacts, :organisations
    add_foreign_key :contacts, :organisations, on_delete: :nullify
  end
end
