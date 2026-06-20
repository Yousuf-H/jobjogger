# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    email { Faker::Internet.unique.email }
    password { "Password1!" }
    password_confirmation { "Password1!" }
    terms_agreed_at { Time.current }

    trait :with_jobs do
      after(:create) do |user|
        create_list(:job, 3, user: user)
      end
    end

    trait :demo do
      demo { true }
    end

    trait :admin do
      admin { true }
    end

    trait :google do
      google_uid { SecureRandom.hex(16) }
    end

    trait :follow_up_reminders_off do
      notify_follow_up_reminders { false }
    end

    trait :interview_reminders_off do
      notify_interview_reminders { false }
    end
  end
end
