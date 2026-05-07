# frozen_string_literal: true

FactoryBot.define do
  factory :interview_question do
    association :user
    question     { Faker::Lorem.question }
    category     { "behavioural" }
    is_favourite { false }

    trait :technical do
      category { "technical" }
    end

    trait :questions_to_ask do
      category { "questions_to_ask" }
    end

    trait :favourite do
      is_favourite { true }
    end

    trait :with_answer do
      answer { Faker::Lorem.paragraph }
    end

    trait :scoped_to_job do
      association :job
    end
  end
end
