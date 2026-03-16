# frozen_string_literal: true

FactoryBot.define do
  factory :job do
    association :user
    company_name { Faker::Company.name }
    job_title    { Faker::Job.title }
    status       { "wishlist" }
    location     { Faker::Address.city }
    employment_type { "full_time" }
    salary_range { "$#{Faker::Number.between(from: 60, to: 100)}k – $#{Faker::Number.between(from: 101, to: 150)}k" }
    source       { "linkedin" }
    job_url      { Faker::Internet.url(scheme: "https") }
    notes        { Faker::Lorem.sentence }
    priority     { "medium" }
    tags         { [] }

    # ── Status traits ──────────────────────────────────────────────────────────

    trait :wishlist do
      status { "wishlist" }
    end

    trait :applied do
      status     { "applied" }
      date_applied { Faker::Date.backward(days: 30) }
    end

    trait :phone_screen do
      status { "phone_screen" }
      date_applied { Faker::Date.backward(days: 25) }
    end

    trait :interviewing do
      status { "interviewing" }
      date_applied { Faker::Date.backward(days: 20) }
    end

    trait :offer do
      status { "offer" }
      date_applied { Faker::Date.backward(days: 14) }
    end

    trait :accepted do
      status { "accepted" }
      date_applied { Faker::Date.backward(days: 7) }
    end

    trait :rejected do
      status { "rejected" }
      date_applied { Faker::Date.backward(days: 10) }
    end

    trait :ghosted do
      status { "ghosted" }
      date_applied { Faker::Date.backward(days: 45) }
    end

    trait :withdrawn do
      status { "withdrawn" }
      date_applied { Faker::Date.backward(days: 5) }
    end

    # ── Archived ───────────────────────────────────────────────────────────────

    trait :archived do
      archived_at { 2.days.ago }
    end

    # ── Follow-up date helpers ─────────────────────────────────────────────────

    trait :overdue do
      follow_up_date { 3.days.ago.to_date }
    end

    trait :due_this_week do
      follow_up_date { Date.current.end_of_week(:sunday) }
    end

    # ── Source traits ──────────────────────────────────────────────────────────

    trait :from_seek do
      source { "seek" }
    end

    trait :from_referral do
      source { "referral" }
    end

    trait :from_other do
      source       { "other" }
      source_other { Faker::Company.name }
    end

    # ── Priority traits ────────────────────────────────────────────────────────

    trait :high_priority do
      priority { "high" }
    end

    trait :low_priority do
      priority { "low" }
    end

    # ── With timeline entries ──────────────────────────────────────────────────

    trait :with_timeline_entries do
      after(:create) do |job|
        create_list(:timeline_entry, 2, job: job)
      end
    end
  end
end
