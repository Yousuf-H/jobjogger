class CreateInterviewQuestions < ActiveRecord::Migration[8.1]
  def change
    create_table :interview_questions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :job, null: true, foreign_key: true
      t.references :organisation, null: true, foreign_key: true
      t.text :question, null: false
      t.text :answer
      t.string :category, null: false
      t.boolean :is_favourite, null: false, default: false

      t.timestamps
    end

    add_index :interview_questions, [ :user_id, :category ]
  end
end
