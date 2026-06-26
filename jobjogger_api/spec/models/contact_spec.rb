# frozen_string_literal: true

require "rails_helper"

RSpec.describe Contact, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:organisation).optional }
    it { is_expected.to have_many(:contact_jobs).dependent(:destroy) }
    it { is_expected.to have_many(:jobs).through(:contact_jobs) }
    it { is_expected.to have_many(:contact_interactions).dependent(:destroy) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:contact) }

    it { is_expected.to validate_presence_of(:name) }

    context "organisation ownership" do
      let(:user)           { create(:user) }
      let(:own_org)        { create(:organisation, user: user) }
      let(:other_user_org) { create(:organisation, user: create(:user)) }

      it "is valid when organisation belongs to the same user" do
        contact = build(:contact, user: user, organisation: own_org)
        expect(contact).to be_valid
      end

      it "is valid when no organisation is set" do
        contact = build(:contact, user: user, organisation: nil)
        expect(contact).to be_valid
      end

      it "is invalid when organisation belongs to a different user" do
        contact = build(:contact, user: user, organisation: other_user_org)
        expect(contact).not_to be_valid
        expect(contact.errors[:organisation]).to be_present
      end

      it "is invalid when organisation_id is set to a nonexistent id" do
        contact = build(:contact, user: user, organisation_id: 0)
        expect(contact).not_to be_valid
        expect(contact.errors[:organisation]).to be_present
      end
    end
  end

  # ── Constants ─────────────────────────────────────────────────────────────────

  describe "INTERACTION_TYPES" do
    it "includes all expected interaction types" do
      expect(Contact::INTERACTION_TYPES).to contain_exactly(
        "email", "call", "coffee_chat", "linkedin", "interview", "other"
      )
    end
  end

  # ── Cascade behaviour ─────────────────────────────────────────────────────────

  describe "cascade on destroy" do
    let(:user)    { create(:user) }
    let(:contact) { create(:contact, user: user) }

    it "destroys associated contact_interactions when contact is destroyed" do
      create(:contact_interaction, contact: contact)
      expect { contact.destroy }.to change(ContactInteraction, :count).by(-1)
    end

    it "destroys associated contact_jobs when contact is destroyed" do
      job = create(:job, user: user)
      ContactJob.create!(contact: contact, job: job)
      expect { contact.destroy }.to change(ContactJob, :count).by(-1)
    end
  end
end
