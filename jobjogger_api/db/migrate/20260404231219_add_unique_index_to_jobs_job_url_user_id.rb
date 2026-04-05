class AddUniqueIndexToJobsJobUrlUserId < ActiveRecord::Migration[8.1]
  def change
    add_index :jobs, [ :user_id, :job_url ], unique: true,
              where: "job_url IS NOT NULL",
              name: 'index_jobs_on_user_id_and_job_url'
  end
end
