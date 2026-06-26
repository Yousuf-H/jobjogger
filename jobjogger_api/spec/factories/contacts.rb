# frozen_string_literal: true

FactoryBot.define do
  factory :contact do
    association :user
    name  { Faker::Name.name }
    role  { Faker::Job.title }
    email { Faker::Internet.unique.email }
    phone { Faker::PhoneNumber.phone_number }

    trait :with_organisation do
      after(:create) do |contact|
        contact.update!(organisation: create(:organisation, user: contact.user))
      end
    end

    trait :with_interactions do
      after(:create) do |contact|
        create_list(:contact_interaction, 2, contact: contact)
      end
    end
  end

  factory :contact_interaction do
    association :contact
    interaction_type { Contact::INTERACTION_TYPES.sample }
    notes            { Faker::Lorem.sentence }
    occurred_at      { Faker::Time.backward(days: 30) }
  end
end
