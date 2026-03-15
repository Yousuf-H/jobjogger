# frozen_string_literal: true

FactoryBot.define do
  factory :jwt_denylist do
    jti { SecureRandom.uuid }
    exp { 24.hours.from_now }

    trait :expired_token do
      exp { 1.hour.ago }
    end
  end
end
