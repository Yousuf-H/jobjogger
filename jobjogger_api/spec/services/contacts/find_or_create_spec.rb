# frozen_string_literal: true

require "rails_helper"

RSpec.describe Contacts::FindOrCreate do
  let(:user) { create(:user) }

  subject(:call) { described_class.new(user: user, name: name, organisation: organisation).call }

  let(:organisation) { nil }

  describe "#call" do
    context "when name is blank" do
      let(:name) { "" }

      it "returns nil without creating anything" do
        expect(call).to be_nil
        expect(user.contacts.count).to eq(0)
      end
    end

    context "when name is nil" do
      let(:name) { nil }

      it "returns nil" do
        expect(call).to be_nil
      end
    end

    context "when no matching contact exists" do
      let(:name) { "Jane Doe" }

      it "creates and returns a new contact" do
        expect { call }.to change { user.contacts.count }.by(1)
        expect(call.name).to eq("Jane Doe")
      end
    end

    context "when a contact with the same name (case-insensitive) and no org exists" do
      let!(:existing) { create(:contact, user: user, name: "Jane Doe", organisation: nil) }
      let(:name) { "jane doe" }

      it "returns the existing contact without creating a new one" do
        expect { call }.not_to change { Contact.count }
        expect(call).to eq(existing)
      end
    end

    context "when a contact with the same name exists at the same organisation" do
      let(:org) { create(:organisation, user: user) }
      let!(:existing) { create(:contact, user: user, name: "Jane Doe", organisation: org) }
      let(:name) { "Jane Doe" }
      let(:organisation) { org }

      it "returns the existing contact" do
        expect { call }.not_to change { Contact.count }
        expect(call).to eq(existing)
      end
    end

    context "when a contact with the same name exists but at a different organisation" do
      let(:org_a) { create(:organisation, user: user) }
      let(:org_b) { create(:organisation, user: user) }
      let!(:existing) { create(:contact, user: user, name: "Jane Doe", organisation: org_a) }
      let(:name) { "Jane Doe" }
      let(:organisation) { org_b }

      it "creates a new contact for the different organisation" do
        expect { call }.to change { user.contacts.count }.by(1)
      end
    end

    context "when a contact with the same name exists at an org but we are looking without an org" do
      let(:org) { create(:organisation, user: user) }
      let!(:existing) { create(:contact, user: user, name: "Jane Doe", organisation: org) }
      let(:name) { "Jane Doe" }
      let(:organisation) { nil }

      it "creates a new contact with no organisation" do
        expect { call }.to change { user.contacts.count }.by(1)
      end
    end

    context "when a contact with the same name belongs to a different user" do
      let!(:other_contact) { create(:contact, name: "Jane Doe") }
      let(:name) { "Jane Doe" }

      it "creates a new contact for this user" do
        expect { call }.to change { user.contacts.count }.by(1)
      end
    end

    context "when extra_attributes are provided" do
      let(:name) { "Jane Doe" }
      subject(:call) do
        described_class.new(
          user: user,
          name: name,
          organisation: nil,
          extra_attributes: { role: "Engineer", email: "jane@example.com" }
        ).call
      end

      it "sets the extra attributes on the new contact" do
        contact = call
        expect(contact.role).to eq("Engineer")
        expect(contact.email).to eq("jane@example.com")
      end
    end

    context "whitespace stripping" do
      let(:name) { "  Jane Doe  " }

      it "strips leading and trailing whitespace before matching or creating" do
        expect(call.name).to eq("Jane Doe")
      end
    end
  end
end
