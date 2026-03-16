# frozen_string_literal: true

FactoryBot.define do
  factory :timeline_entry do
    association :job
    entry_type  { "note" }
    description { Faker::Lorem.sentence(word_count: 10) }
    occurred_at { Faker::Time.backward(days: 7) }

    trait :note do
      entry_type { "note" }
    end

    trait :contact do
      entry_type  { "contact" }
      description { "Spoke with #{Faker::Name.name} from #{Faker::Company.name}" }
    end

    trait :interview do
      entry_type  { "interview" }
      description { "#{Faker::Job.title} interview – #{Faker::Lorem.sentence}" }
      metadata    { { "interviewer" => Faker::Name.name, "format" => "video" } }
    end

    trait :assessment do
      entry_type  { "assessment" }
      description { "Technical assessment: #{Faker::Lorem.sentence}" }
    end

    trait :follow_up do
      entry_type  { "follow_up" }
      description { "Followed up via email regarding application status" }
    end

    trait :status_change do
      entry_type  { "status_change" }
      description { "Status changed from wishlist to applied" }
    end

    trait :with_metadata do
      metadata { { "platform" => "Zoom", "duration_minutes" => 45 } }
    end
  end
end
