# frozen_string_literal: true

FactoryBot.define do
  factory :notification do
    association :user
    association :job
    kind { :stage_stall }
    body { "Your job application has stalled." }
    read_at { nil }

    trait :read do
      read_at { 1.hour.ago }
    end

    trait :stage_stall do
      kind { :stage_stall }
    end

    trait :deadline_reminder do
      kind { :deadline_reminder }
      body { "Deadline approaching soon." }
    end

    trait :follow_up_due do
      kind { :follow_up_due }
      body { "Consider following up." }
    end

    trait :interview_reminder do
      kind { :interview_reminder }
      body { "Interview coming up." }
    end
  end
end
