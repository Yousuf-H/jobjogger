# frozen_string_literal: true

FactoryBot.define do
  factory :resume_variant do
    association :resume_template
    user { resume_template.user }
    notes { Faker::Lorem.sentence }
  end
end
