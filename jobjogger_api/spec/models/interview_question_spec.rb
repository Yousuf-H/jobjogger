# frozen_string_literal: true

require "rails_helper"

RSpec.describe InterviewQuestion, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:job).optional }
    it { is_expected.to belong_to(:organisation).optional }
    it { is_expected.to have_many(:job_interview_questions).dependent(:destroy) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:interview_question) }

    it { is_expected.to validate_presence_of(:question) }
    it { is_expected.to validate_presence_of(:category) }

    context "single_scope — job and organisation are mutually exclusive" do
      let(:user) { create(:user) }
      let(:job)  { create(:job, user: user) }
      let(:org)  { create(:organisation, user: user) }

      it "is valid when scoped to a job only" do
        q = build(:interview_question, user: user, job: job, organisation: nil)
        expect(q).to be_valid
      end

      it "is valid when scoped to an organisation only" do
        q = build(:interview_question, user: user, job: nil, organisation: org)
        expect(q).to be_valid
      end

      it "is valid when personal (no scope set)" do
        q = build(:interview_question, user: user, job: nil, organisation: nil)
        expect(q).to be_valid
      end

      it "is invalid when scoped to both a job and an organisation" do
        q = build(:interview_question, user: user, job: job, organisation: org)
        expect(q).not_to be_valid
        expect(q.errors[:base]).to include("A question can only be scoped to a job or an organisation, not both")
      end
    end

    context "scope_compatible_with_existing_pins (on update only)" do
      let(:user)  { create(:user) }
      let(:org_a) { create(:organisation, user: user) }
      let(:org_b) { create(:organisation, user: user) }
      let(:job_a) { create(:job, user: user, organisation: org_a) }
      let(:job_b) { create(:job, user: user, organisation: org_b) }

      context "when rescoping to a specific job" do
        let(:question) { create(:interview_question, user: user) }

        before { JobInterviewQuestion.create!(job: job_a, interview_question: question) }

        it "is valid when the new job matches the job the question is already pinned to" do
          question.job = job_a
          expect(question).to be_valid
        end

        it "is invalid when the question is already pinned to a different job" do
          question.job = job_b
          expect(question).not_to be_valid
          expect(question.errors[:base]).to include(
            "Cannot scope this question to a job while it is pinned to other jobs"
          )
        end
      end

      context "when rescoping to an organisation" do
        let(:question) { create(:interview_question, user: user) }

        before { JobInterviewQuestion.create!(job: job_a, interview_question: question) }

        it "is valid when all pinned jobs belong to the target organisation" do
          question.organisation = org_a
          expect(question).to be_valid
        end

        it "is invalid when a pinned job belongs to a different organisation" do
          question.organisation = org_b
          expect(question).not_to be_valid
          expect(question.errors[:base]).to include(
            "Cannot scope this question to an organisation while it is pinned to jobs in other organisations"
          )
        end

        it "is invalid when a pinned job has no organisation at all" do
          job_no_org = create(:job, user: user, organisation: nil)
          JobInterviewQuestion.create!(job: job_no_org, interview_question: question)
          question.organisation = org_a
          expect(question).not_to be_valid
          expect(question.errors[:base]).to include(
            "Cannot scope this question to an organisation while it is pinned to jobs in other organisations"
          )
        end
      end

      it "does not run pin-conflict checks on create" do
        question = build(:interview_question, user: user, job: job_a)
        expect(question).to be_valid
      end
    end
  end

  # ── Enums ────────────────────────────────────────────────────────────────────

  describe "enums" do
    it "defines the expected category values" do
      expect(InterviewQuestion.categories.keys).to contain_exactly(
        "behavioural", "technical", "questions_to_ask"
      )
    end
  end

  # ── Scopes ───────────────────────────────────────────────────────────────────

  describe "scopes" do
    let(:user) { create(:user) }
    let(:job)  { create(:job, user: user) }
    let(:org)  { create(:organisation, user: user) }

    let!(:personal_q)  { create(:interview_question, user: user) }
    let!(:job_q)       { create(:interview_question, user: user, job: job) }
    let!(:org_q)       { create(:interview_question, user: user, organisation: org) }
    let!(:favourite_q) { create(:interview_question, :favourite, user: user) }

    describe ".personal" do
      it "returns only questions with no job or organisation scope" do
        results = InterviewQuestion.personal
        expect(results).to include(personal_q, favourite_q)
        expect(results).not_to include(job_q, org_q)
      end
    end

    describe ".for_job" do
      it "returns only questions scoped to the given job" do
        results = InterviewQuestion.for_job(job)
        expect(results).to include(job_q)
        expect(results).not_to include(personal_q, org_q, favourite_q)
      end
    end

    describe ".for_organisation" do
      it "returns only questions scoped to the given organisation with no job" do
        results = InterviewQuestion.for_organisation(org)
        expect(results).to include(org_q)
        expect(results).not_to include(personal_q, job_q, favourite_q)
      end
    end

    describe ".favourites" do
      it "returns only questions marked as favourite" do
        results = InterviewQuestion.favourites
        expect(results).to include(favourite_q)
        expect(results).not_to include(personal_q, job_q, org_q)
      end
    end
  end
end
