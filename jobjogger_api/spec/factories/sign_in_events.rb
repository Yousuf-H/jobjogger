# frozen_string_literal: true

FactoryBot.define do
  factory :sign_in_event do
    user
    created_at { Time.current }
  end
end
