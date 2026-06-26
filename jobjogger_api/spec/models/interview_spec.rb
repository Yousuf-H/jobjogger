# frozen_string_literal: true

require "rails_helper"

RSpec.describe Interview, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:job) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:interview) }

    it { is_expected.to validate_presence_of(:scheduled_at) }
    it { is_expected.to validate_presence_of(:interview_type) }
    it { is_expected.to validate_presence_of(:outcome) }
  end

  # ── Enums ────────────────────────────────────────────────────────────────────

  describe "enums" do
    it "defines the expected interview_type values" do
      expect(Interview.interview_types.keys).to contain_exactly(
        "phone_screen", "technical", "panel", "final", "other"
      )
    end

    it "defines the expected format values" do
      expect(Interview.formats.keys).to contain_exactly("video", "phone", "in_person")
    end

    it "defines the expected outcome values" do
      expect(Interview.outcomes.keys).to contain_exactly("pending", "passed", "failed")
    end
  end

  # ── Scopes ───────────────────────────────────────────────────────────────────

  describe "scopes" do
    let(:job)             { create(:job) }
    let!(:future)         { create(:interview, job: job, scheduled_at: 2.days.from_now) }
    let!(:past_interview) { create(:interview, job: job, scheduled_at: 2.days.ago) }

    describe ".upcoming" do
      it "returns only interviews scheduled in the future" do
        expect(Interview.upcoming).to include(future)
        expect(Interview.upcoming).not_to include(past_interview)
      end
    end

    describe ".past" do
      it "returns only interviews that have already occurred" do
        expect(Interview.past).to include(past_interview)
        expect(Interview.past).not_to include(future)
      end
    end

    describe ".ordered" do
      it "returns interviews in ascending scheduled_at order" do
        results = Interview.ordered.to_a
        expect(results.first).to eq(past_interview)
        expect(results.last).to eq(future)
      end
    end
  end

  # ── Instance methods ──────────────────────────────────────────────────────────

  describe "#debrief_available?" do
    it "returns true for an interview that has already occurred" do
      interview = build(:interview, :past)
      expect(interview.debrief_available?).to be(true)
    end

    it "returns false for an interview scheduled in the future" do
      interview = build(:interview, scheduled_at: 1.day.from_now)
      expect(interview.debrief_available?).to be(false)
    end
  end
end
