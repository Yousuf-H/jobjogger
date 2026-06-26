# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notification, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:job).optional }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:notification) }

    it { is_expected.to validate_presence_of(:body) }
    it { is_expected.to validate_presence_of(:kind) }
  end

  # ── Enums ────────────────────────────────────────────────────────────────────

  describe "enums" do
    it "defines the expected kind values" do
      expect(Notification.kinds.keys).to contain_exactly(
        "stage_stall", "deadline_reminder", "follow_up_due", "interview_reminder"
      )
    end
  end

  # ── Scopes ───────────────────────────────────────────────────────────────────

  describe "scopes" do
    let(:user) { create(:user) }

    describe ".unread" do
      let!(:unread) { create(:notification, user: user, read_at: nil) }
      let!(:read)   { create(:notification, :read, user: user) }

      it "returns only notifications that have not been read" do
        expect(Notification.unread).to include(unread)
        expect(Notification.unread).not_to include(read)
      end
    end

    describe ".recent" do
      it "orders notifications newest first" do
        older = create(:notification, user: user, created_at: 2.hours.ago)
        newer = create(:notification, user: user, created_at: 1.minute.ago)
        results = Notification.recent.to_a
        expect(results.index(newer)).to be < results.index(older)
      end
    end
  end

  # ── Instance methods ──────────────────────────────────────────────────────────

  describe "#mark_read!" do
    it "sets read_at to approximately the current time" do
      notification = create(:notification, read_at: nil)
      expect { notification.mark_read! }.to change { notification.read_at }.from(nil)
      expect(notification.read_at).to be_within(2.seconds).of(Time.current)
    end

    it "persists the change to the database" do
      notification = create(:notification, read_at: nil)
      notification.mark_read!
      expect(notification.reload.read_at).to be_present
    end
  end

  # ── Class methods ─────────────────────────────────────────────────────────────

  describe ".unread_count_for" do
    let(:user)       { create(:user) }
    let(:other_user) { create(:user) }

    it "counts only unread notifications for the given user" do
      create_list(:notification, 3, user: user, read_at: nil)
      create(:notification, :read, user: user)
      expect(Notification.unread_count_for(user)).to eq(3)
    end

    it "does not count notifications belonging to other users" do
      create(:notification, user: other_user, read_at: nil)
      expect(Notification.unread_count_for(user)).to eq(0)
    end
  end
end
