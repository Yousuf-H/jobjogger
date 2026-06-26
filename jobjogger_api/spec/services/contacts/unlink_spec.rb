# frozen_string_literal: true

require "rails_helper"

RSpec.describe Contacts::Unlink do
  let(:user)    { create(:user) }
  let(:contact) { create(:contact, user: user) }
  let(:job)     { create(:job, user: user) }

  subject(:call) { described_class.new(contact: contact, job: job).call }

  describe "#call" do
    context "when the link exists" do
      before { ContactJob.create!(contact: contact, job: job) }

      it "returns true" do
        expect(call).to be true
      end

      it "removes the ContactJob link" do
        expect { call }.to change { ContactJob.count }.by(-1)
      end
    end

    context "when no link exists" do
      it "returns false" do
        expect(call).to be false
      end

      it "does not change ContactJob count" do
        expect { call }.not_to change { ContactJob.count }
      end
    end

    context "orphan cleanup — contact has no org, no remaining jobs, and no interactions" do
      before { ContactJob.create!(contact: contact, job: job) }

      it "destroys the contact after unlinking" do
        expect { call }.to change { Contact.exists?(contact.id) }.from(true).to(false)
      end
    end

    context "orphan cleanup — contact still has other jobs" do
      let(:other_job) { create(:job, user: user) }

      before do
        ContactJob.create!(contact: contact, job: job)
        ContactJob.create!(contact: contact, job: other_job)
      end

      it "does not destroy the contact" do
        call
        expect(Contact.exists?(contact.id)).to be true
      end
    end

    context "orphan cleanup — contact has an organisation" do
      let(:contact) { create(:contact, :with_organisation, user: user) }

      before { ContactJob.create!(contact: contact, job: job) }

      it "does not destroy the contact" do
        call
        expect(Contact.exists?(contact.id)).to be true
      end
    end

    context "orphan cleanup — contact has interactions" do
      before do
        ContactJob.create!(contact: contact, job: job)
        create(:contact_interaction, contact: contact)
      end

      it "does not destroy the contact" do
        call
        expect(Contact.exists?(contact.id)).to be true
      end
    end
  end
end
