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

      it "preserves the contact even when it has no other connections" do
        expect { call }.not_to change { Contact.exists?(contact.id) }.from(true)
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
  end
end
