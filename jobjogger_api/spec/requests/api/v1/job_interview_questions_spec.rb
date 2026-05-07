# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Job Interview Questions API", type: :request do
  let(:user)     { create(:user) }
  let(:headers)  { auth_headers_for(user) }
  let(:job)      { create(:job, :interviewing, user: user) }
  let(:question) { create(:interview_question, user: user) }

  # ── GET /api/v1/jobs/:job_id/job_interview_questions ─────────────────────────

  describe "GET /api/v1/jobs/:job_id/job_interview_questions" do
    before { job.job_interview_questions.create!(interview_question: question) }

    it "returns questions pinned to the job" do
      get "/api/v1/jobs/#{job.id}/job_interview_questions", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response.map { |q| q["id"] }).to include(question.id)
    end

    it "does not return questions pinned to other jobs" do
      other_question = create(:interview_question, user: user)
      other_job = create(:job, user: user)
      other_job.job_interview_questions.create!(interview_question: other_question)

      get "/api/v1/jobs/#{job.id}/job_interview_questions", headers: headers
      ids = json_response.map { |q| q["id"] }
      expect(ids).not_to include(other_question.id)
    end

    it "returns 404 for another user's job" do
      other_job = create(:job, user: create(:user))
      get "/api/v1/jobs/#{other_job.id}/job_interview_questions", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      get "/api/v1/jobs/#{job.id}/job_interview_questions",
          headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/jobs/:job_id/job_interview_questions (associate existing) ────

  describe "POST /api/v1/jobs/:job_id/job_interview_questions — associate existing" do
    it "pins an existing question to the job" do
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: { interview_question_id: question.id }.to_json, headers: headers
      expect(response).to have_http_status(:created)
      expect(job.pinned_questions.reload).to include(question)
    end

    it "returns the question in the response" do
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: { interview_question_id: question.id }.to_json, headers: headers
      expect(json_response["id"]).to eq(question.id)
      expect(json_response["question"]).to eq(question.question)
    end

    it "is idempotent — pinning twice does not create a duplicate" do
      job.job_interview_questions.create!(interview_question: question)
      expect {
        post "/api/v1/jobs/#{job.id}/job_interview_questions",
             params: { interview_question_id: question.id }.to_json, headers: headers
      }.not_to change(JobInterviewQuestion, :count)
    end

    it "returns 422 when pinning an org-scoped question to a job in a different org" do
      org_a = create(:organisation, user: user)
      org_b = create(:organisation, user: user)
      org_question = create(:interview_question, user: user, organisation: org_a)
      job_in_org_b = create(:job, user: user, organisation: org_b)
      post "/api/v1/jobs/#{job_in_org_b.id}/job_interview_questions",
           params: { interview_question_id: org_question.id }.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 422 when pinning a job-scoped question to a different job" do
      other_job = create(:job, user: user)
      job_question = create(:interview_question, user: user, job: other_job)
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: { interview_question_id: job_question.id }.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 404 for a question that does not belong to the user" do
      other_question = create(:interview_question, user: create(:user))
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: { interview_question_id: other_question.id }.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for another user's job" do
      other_job = create(:job, user: create(:user))
      post "/api/v1/jobs/#{other_job.id}/job_interview_questions",
           params: { interview_question_id: question.id }.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: { interview_question_id: question.id }.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/jobs/:job_id/job_interview_questions (create new + pin) ──────

  describe "POST /api/v1/jobs/:job_id/job_interview_questions — create and pin" do
    let(:valid_params) do
      {
        interview_question: {
          question: "Tell me about a time you resolved a conflict.",
          category: "behavioural"
        }
      }
    end

    it "creates a new question and pins it to the job atomically" do
      expect {
        post "/api/v1/jobs/#{job.id}/job_interview_questions",
             params: valid_params.to_json, headers: headers
      }.to change(InterviewQuestion, :count).by(1)
        .and change(JobInterviewQuestion, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "scopes the new question to the current user" do
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: valid_params.to_json, headers: headers
      expect(InterviewQuestion.last.user).to eq(user)
    end

    it "returns the new question in the response" do
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: valid_params.to_json, headers: headers
      expect(json_response["question"]).to eq("Tell me about a time you resolved a conflict.")
      expect(json_response["category"]).to eq("behavioural")
    end

    it "accepts an optional answer" do
      params = valid_params.deep_merge(interview_question: { answer: "I mediated by..." })
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: params.to_json, headers: headers
      expect(response).to have_http_status(:created)
      expect(json_response["answer"]).to eq("I mediated by...")
    end

    context "with invalid params" do
      it "returns 422 when question text is missing" do
        params = { interview_question: { category: "behavioural" } }
        post "/api/v1/jobs/#{job.id}/job_interview_questions",
             params: params.to_json, headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to be_present
      end

      it "does not create the question or the join record on failure" do
        params = { interview_question: { category: "behavioural" } }
        expect {
          post "/api/v1/jobs/#{job.id}/job_interview_questions",
               params: params.to_json, headers: headers
        }.not_to change(InterviewQuestion, :count)
        expect(JobInterviewQuestion.count).to eq(0)
      end
    end

    it "returns 401 without authentication" do
      post "/api/v1/jobs/#{job.id}/job_interview_questions",
           params: valid_params.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── DELETE /api/v1/jobs/:job_id/job_interview_questions/:id ──────────────────

  describe "DELETE /api/v1/jobs/:job_id/job_interview_questions/:id" do
    before { job.job_interview_questions.create!(interview_question: question) }

    it "unpins the question from the job" do
      expect {
        delete "/api/v1/jobs/#{job.id}/job_interview_questions/#{question.id}", headers: headers
      }.to change(JobInterviewQuestion, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "does not delete the question itself" do
      expect {
        delete "/api/v1/jobs/#{job.id}/job_interview_questions/#{question.id}", headers: headers
      }.not_to change(InterviewQuestion, :count)
    end

    it "returns 404 for a question not pinned to this job" do
      unpinned = create(:interview_question, user: user)
      delete "/api/v1/jobs/#{job.id}/job_interview_questions/#{unpinned.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for another user's job" do
      other_job = create(:job, user: create(:user))
      delete "/api/v1/jobs/#{other_job.id}/job_interview_questions/#{question.id}",
             headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      delete "/api/v1/jobs/#{job.id}/job_interview_questions/#{question.id}",
             headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
