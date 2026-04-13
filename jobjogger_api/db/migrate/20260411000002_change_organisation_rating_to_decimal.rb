class ChangeOrganisationRatingToDecimal < ActiveRecord::Migration[8.1]
  def up
    change_column :organisations, :rating, :decimal, precision: 3, scale: 1
  end

  def down
    change_column :organisations, :rating, :integer
  end
end
