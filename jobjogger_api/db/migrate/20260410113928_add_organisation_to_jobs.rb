class AddOrganisationToJobs < ActiveRecord::Migration[8.1]
  def change
    add_reference :jobs, :organisation, null: true, foreign_key: true
  end
end
