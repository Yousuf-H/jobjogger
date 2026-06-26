# frozen_string_literal: true

require "rails_helper"

RSpec.describe Contacts::Link do
  let(:user)    { create(:user) }
  let(:contact) { create(:contact, user: user) }
  let(:job)     { create(:job, user: user) }

  subject(:call) { described_class.new(contact: contact, job: job).call }

  describe "#call" do
    context "when contact and job are both present" do
      it "returns true" do
        expect(call).to be true
      end

      it "creates a ContactJob link" do
        expect { call }.to change { ContactJob.count }.by(1)
      end

      it "links the correct contact and job" do
        call
        link = ContactJob.last
        expect(link.contact).to eq(contact)
        expect(link.job).to eq(job)
      end
    end

    context "when the link already exists (idempotent)" do
      before { ContactJob.create!(contact: contact, job: job) }

      it "returns true" do
        expect(call).to be true
      end

      it "does not create a duplicate link" do
        expect { call }.not_to change { ContactJob.count }
      end
    end

    context "when contact is nil" do
      let(:contact) { nil }

      it "returns false" do
        expect(call).to be false
      end

      it "does not create any record" do
        expect { call }.not_to change { ContactJob.count }
      end
    end

    context "when job is nil" do
      let(:job) { nil }

      it "returns false" do
        expect(call).to be false
      end

      it "does not create any record" do
        expect { call }.not_to change { ContactJob.count }
      end
    end
  end
end
