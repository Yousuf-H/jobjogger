class CreateJobInterviewQuestions < ActiveRecord::Migration[8.0]
  def change
    create_table :job_interview_questions do |t|
      t.references :job, null: false, foreign_key: true
      t.references :interview_question, null: false, foreign_key: true
      t.timestamps
    end

    add_index :job_interview_questions, [:job_id, :interview_question_id], unique: true,
              name: 'index_job_interview_questions_on_job_and_question'
  end
end
