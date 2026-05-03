# frozen_string_literal: true

FactoryBot.define do
  factory :interview do
    association :job
    scheduled_at   { 3.days.from_now }
    interview_type { "phone_screen" }
    outcome        { "pending" }

    trait :technical do
      interview_type { "technical" }
    end

    trait :panel do
      interview_type { "panel" }
    end

    trait :passed do
      outcome { "passed" }
    end

    trait :failed do
      outcome { "failed" }
    end

    trait :past do
      scheduled_at { 2.days.ago }
    end

    trait :with_notes do
      prep_notes    { "Research the company's recent product launches." }
      debrief_notes { "Went well. Follow up on timeline." }
    end
  end
end
