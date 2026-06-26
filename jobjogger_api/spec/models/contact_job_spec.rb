# frozen_string_literal: true

require "rails_helper"

RSpec.describe ContactJob, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:contact) }
    it { is_expected.to belong_to(:job) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "uniqueness of contact–job pair" do
    let(:user)    { create(:user) }
    let(:contact) { create(:contact, user: user) }
    let(:job)     { create(:job, user: user) }

    it "is valid when linking a contact to a job for the first time" do
      record = ContactJob.new(contact: contact, job: job)
      expect(record).to be_valid
    end

    it "is invalid when the same contact is linked to the same job a second time" do
      ContactJob.create!(contact: contact, job: job)
      duplicate = ContactJob.new(contact: contact, job: job)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:contact_id]).to be_present
    end

    it "allows the same contact to be linked to different jobs" do
      other_job = create(:job, user: user)
      ContactJob.create!(contact: contact, job: job)
      record = ContactJob.new(contact: contact, job: other_job)
      expect(record).to be_valid
    end

    it "allows different contacts to be linked to the same job" do
      other_contact = create(:contact, user: user)
      ContactJob.create!(contact: contact, job: job)
      record = ContactJob.new(contact: other_contact, job: job)
      expect(record).to be_valid
    end
  end
end
