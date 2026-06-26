# frozen_string_literal: true

require "rails_helper"

RSpec.describe ContactInteraction, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:contact) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:contact_interaction) }

    it { is_expected.to validate_presence_of(:interaction_type) }
    it { is_expected.to validate_presence_of(:occurred_at) }

    context "interaction_type inclusion" do
      it "accepts every defined interaction type" do
        Contact::INTERACTION_TYPES.each do |type|
          interaction = build(:contact_interaction, interaction_type: type)
          expect(interaction).to be_valid, "expected #{type.inspect} to be a valid interaction type"
        end
      end

      it "rejects an unknown interaction type" do
        interaction = build(:contact_interaction, interaction_type: "fax")
        expect(interaction).not_to be_valid
        expect(interaction.errors[:interaction_type]).to be_present
      end
    end
  end

  # ── Persistence ──────────────────────────────────────────────────────────────

  describe "persistence" do
    it "can be created with valid attributes" do
      interaction = build(:contact_interaction)
      expect { interaction.save! }.to change(ContactInteraction, :count).by(1)
    end
  end
end
