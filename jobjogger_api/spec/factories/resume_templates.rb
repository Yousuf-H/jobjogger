# frozen_string_literal: true

FactoryBot.define do
  factory :resume_template do
    association :user
    name  { "#{Faker::Job.title} Resume" }
    notes { Faker::Lorem.sentence }
  end
end
