# frozen_string_literal: true

require "rails_helper"

RSpec.describe Organisations::FindOrCreate do
  let(:user) { create(:user) }

  subject(:call) { described_class.new(user: user, company_name: company_name).call }

  describe "#call" do
    context "when company_name is blank" do
      let(:company_name) { "" }

      it "returns nil without creating anything" do
        expect(call).to be_nil
        expect(user.organisations.count).to eq(0)
      end
    end

    context "when company_name is nil" do
      let(:company_name) { nil }

      it "returns nil" do
        expect(call).to be_nil
      end
    end

    context "when no matching organisation exists" do
      let(:company_name) { "Acme Corp" }

      it "creates and returns a new organisation" do
        expect { call }.to change { user.organisations.count }.by(1)
        expect(call.name).to eq("Acme Corp")
      end

      it "marks the new organisation as needs_review" do
        expect(call.needs_review).to be true
      end
    end

    context "when an organisation with the same name already exists (case-insensitive)" do
      let!(:existing) { create(:organisation, user: user, name: "Acme Corp") }
      let(:company_name) { "acme corp" }

      it "returns the existing organisation without creating a new one" do
        expect { call }.not_to change { Organisation.count }
        expect(call).to eq(existing)
      end
    end

    context "when the company_name matches an alias (case-insensitive)" do
      let!(:existing) { create(:organisation, user: user, name: "Acme Corp", aliases: [ "Acme", "ACME Ltd" ]) }
      let(:company_name) { "acme" }

      it "returns the organisation matched by alias" do
        expect { call }.not_to change { Organisation.count }
        expect(call).to eq(existing)
      end
    end

    context "when an organisation with the same name belongs to a different user" do
      let!(:other_org) { create(:organisation, name: "Acme Corp") }
      let(:company_name) { "Acme Corp" }

      it "creates a new organisation for this user" do
        expect { call }.to change { user.organisations.count }.by(1)
      end
    end

    context "when the demo user has reached the 20-organisation limit" do
      let(:user) { create(:user, :demo) }
      let(:company_name) { "New Corp" }

      before { create_list(:organisation, 20, user: user) }

      it "raises ArgumentError" do
        expect { call }.to raise_error(ArgumentError, /Demo account/)
      end
    end

    context "when the demo user is under the limit" do
      let(:user) { create(:user, :demo) }
      let(:company_name) { "New Corp" }

      before { create_list(:organisation, 5, user: user) }

      it "creates the organisation" do
        expect { call }.to change { user.organisations.count }.by(1)
      end
    end

    context "whitespace stripping" do
      let(:company_name) { "  Acme Corp  " }

      it "strips leading and trailing whitespace before matching" do
        expect(call.name).to eq("Acme Corp")
      end
    end
  end
end
