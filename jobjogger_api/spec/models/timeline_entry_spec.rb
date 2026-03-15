# frozen_string_literal: true

require "rails_helper"

RSpec.describe TimelineEntry, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:job) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:timeline_entry) }

    it { is_expected.to validate_presence_of(:entry_type) }
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_presence_of(:occurred_at) }
    it { is_expected.to validate_length_of(:description).is_at_most(1000) }

    context "description length boundary" do
      it "is valid at exactly 1000 characters" do
        entry = build(:timeline_entry, description: "a" * 1000)
        expect(entry).to be_valid
      end

      it "is invalid at 1001 characters" do
        entry = build(:timeline_entry, description: "a" * 1001)
        expect(entry).not_to be_valid
        expect(entry.errors[:description]).to be_present
      end
    end
  end

  # ── Enums ────────────────────────────────────────────────────────────────────

  describe "enums" do
    it "defines the expected entry_type values" do
      expect(TimelineEntry.entry_types.keys).to contain_exactly(
        "note", "contact", "interview", "assessment", "follow_up", "status_change"
      )
    end
  end

  # ── Custom validation: cannot edit status_change entries ──────────────────────

  describe "cannot_edit_status_change validation (on update)" do
    let(:job) { create(:job) }

    context "when the entry is a status_change" do
      let(:entry) { create(:timeline_entry, :status_change, job: job) }

      it "is invalid when description is changed" do
        entry.description = "New description"
        expect(entry).not_to be_valid
        expect(entry.errors[:base]).to include("Cannot edit auto-generated status change entries")
      end

      it "is invalid when entry_type is changed" do
        entry.entry_type = "note"
        expect(entry).not_to be_valid
        expect(entry.errors[:base]).to include("Cannot edit auto-generated status change entries")
      end

      it "is valid when only occurred_at or metadata are changed" do
        entry.occurred_at = 1.hour.ago
        expect(entry).to be_valid
      end
    end

    context "when the entry is not a status_change" do
      let(:entry) { create(:timeline_entry, :note, job: job) }

      it "is valid when description is updated" do
        entry.description = "Updated note content"
        expect(entry).to be_valid
      end

      it "is valid when entry_type is changed to another non-system type" do
        entry.entry_type = "contact"
        expect(entry).to be_valid
      end
    end
  end

  # ── Persistence ──────────────────────────────────────────────────────────────

  describe "persistence" do
    it "can be created with valid attributes" do
      job   = create(:job)
      entry = build(:timeline_entry, job: job)
      expect { entry.save! }.to change(TimelineEntry, :count).by(1)
    end

    it "stores metadata as JSONB" do
      job   = create(:job)
      entry = create(:timeline_entry, :with_metadata, job: job)
      expect(entry.metadata).to be_a(Hash)
      expect(entry.metadata["platform"]).to eq("Zoom")
    end
  end
end
