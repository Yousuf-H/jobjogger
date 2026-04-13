# frozen_string_literal: true

FactoryBot.define do
  factory :organisation do
    association :user
    name        { Faker::Company.unique.name }
    needs_review { false }

    trait :needs_review do
      needs_review { true }
    end

    trait :with_website do
      website { Faker::Internet.url(scheme: "https") }
    end

    trait :with_aliases do
      aliases { [ Faker::Company.name, Faker::Company.name ] }
    end
  end
end
