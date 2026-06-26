# frozen_string_literal: true

require "rails_helper"

RSpec.describe JobInterviewQuestion, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:job) }
    it { is_expected.to belong_to(:interview_question) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "uniqueness of question per job" do
    let(:user)     { create(:user) }
    let(:job)      { create(:job, user: user) }
    let(:question) { create(:interview_question, user: user) }

    it "is valid when pinning a question to a job for the first time" do
      record = JobInterviewQuestion.new(job: job, interview_question: question)
      expect(record).to be_valid
    end

    it "is invalid when the same question is pinned to the same job a second time" do
      JobInterviewQuestion.create!(job: job, interview_question: question)
      duplicate = JobInterviewQuestion.new(job: job, interview_question: question)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:interview_question_id]).to be_present
    end

    it "allows the same question to be pinned to different jobs" do
      other_job = create(:job, user: user)
      JobInterviewQuestion.create!(job: job, interview_question: question)
      record = JobInterviewQuestion.new(job: other_job, interview_question: question)
      expect(record).to be_valid
    end
  end

  describe "question scope compatibility" do
    let(:user)  { create(:user) }
    let(:org_a) { create(:organisation, user: user) }
    let(:org_b) { create(:organisation, user: user) }
    let(:job_a) { create(:job, user: user, organisation: org_a) }
    let(:job_b) { create(:job, user: user, organisation: org_b) }

    context "when the question is scoped to a specific job" do
      let(:question) { create(:interview_question, user: user, job: job_a) }

      it "is valid when pinning to the job the question is scoped to" do
        record = JobInterviewQuestion.new(job: job_a, interview_question: question)
        expect(record).to be_valid
      end

      it "is invalid when pinning to a different job" do
        record = JobInterviewQuestion.new(job: job_b, interview_question: question)
        expect(record).not_to be_valid
        expect(record.errors[:interview_question]).to be_present
      end
    end

    context "when the question is scoped to a specific organisation" do
      let(:question) { create(:interview_question, user: user, organisation: org_a) }

      it "is valid when pinning to a job that belongs to the question's organisation" do
        record = JobInterviewQuestion.new(job: job_a, interview_question: question)
        expect(record).to be_valid
      end

      it "is invalid when pinning to a job that belongs to a different organisation" do
        record = JobInterviewQuestion.new(job: job_b, interview_question: question)
        expect(record).not_to be_valid
        expect(record.errors[:interview_question]).to be_present
      end
    end

    context "when the question is personal (no scope)" do
      let(:question) { create(:interview_question, user: user) }

      it "is valid when pinning to any job" do
        record = JobInterviewQuestion.new(job: job_a, interview_question: question)
        expect(record).to be_valid
      end
    end
  end
end
