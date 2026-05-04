# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Interview Questions API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:question) { create(:interview_question, user: user) }

  # ── GET /api/v1/interview_questions ──────────────────────────────────────────

  describe "GET /api/v1/interview_questions" do
    before { question }

    it "returns the user's questions" do
      get "/api/v1/interview_questions", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response.map { |q| q["id"] }).to include(question.id)
    end

    it "does not return another user's questions" do
      other_question = create(:interview_question, user: create(:user))
      get "/api/v1/interview_questions", headers: headers
      expect(json_response.map { |q| q["id"] }).not_to include(other_question.id)
    end

    it "defaults to personal scope" do
      job_question = create(:interview_question, user: user, job: create(:job, user: user))
      get "/api/v1/interview_questions", headers: headers
      ids = json_response.map { |q| q["id"] }
      expect(ids).to include(question.id)
      expect(ids).not_to include(job_question.id)
    end

    it "returns all questions when scope=all" do
      job_question = create(:interview_question, user: user, job: create(:job, user: user))
      get "/api/v1/interview_questions", params: { scope: "all" }, headers: headers
      ids = json_response.map { |q| q["id"] }
      expect(ids).to include(question.id, job_question.id)
    end

    it "filters by category" do
      technical = create(:interview_question, user: user, category: "technical")
      get "/api/v1/interview_questions", params: { category: "technical" }, headers: headers
      ids = json_response.map { |q| q["id"] }
      expect(ids).to include(technical.id)
      expect(ids).not_to include(question.id)
    end

    it "returns job-scoped questions when scope=job" do
      job = create(:job, user: user)
      job_question = create(:interview_question, user: user, job: job)
      get "/api/v1/interview_questions", params: { scope: "job", job_id: job.id }, headers: headers
      ids = json_response.map { |q| q["id"] }
      expect(ids).to include(job_question.id)
      expect(ids).not_to include(question.id)
    end

    it "returns empty array when scope=job but no job_id provided" do
      get "/api/v1/interview_questions", params: { scope: "job" }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response).to eq([])
    end

    it "returns 404 when job_id does not belong to the user" do
      other_job = create(:job, user: create(:user))
      get "/api/v1/interview_questions", params: { scope: "job", job_id: other_job.id }, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 when organisation_id does not belong to the user" do
      other_org = create(:organisation, user: create(:user))
      get "/api/v1/interview_questions", params: { scope: "org", organisation_id: other_org.id }, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      get "/api/v1/interview_questions", headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/interview_questions ─────────────────────────────────────────

  describe "POST /api/v1/interview_questions" do
    let(:valid_params) do
      { interview_question: { question: "Tell me about yourself.", category: "behavioural" } }
    end

    it "creates a question for the current user" do
      expect {
        post "/api/v1/interview_questions", params: valid_params.to_json, headers: headers
      }.to change(InterviewQuestion, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(json_response["question"]).to eq("Tell me about yourself.")
    end

    it "scopes the question to the current user" do
      post "/api/v1/interview_questions", params: valid_params.to_json, headers: headers
      expect(InterviewQuestion.last.user).to eq(user)
    end

    it "creates a job-scoped question" do
      job = create(:job, user: user)
      params = { interview_question: { question: "Why this role?", category: "behavioural", job_id: job.id } }
      post "/api/v1/interview_questions", params: params.to_json, headers: headers
      expect(response).to have_http_status(:created)
      expect(json_response["job_id"]).to eq(job.id)
    end

    it "returns 404 when job_id belongs to another user" do
      other_job = create(:job, user: create(:user))
      params = { interview_question: { question: "Why this role?", category: "behavioural", job_id: other_job.id } }
      post "/api/v1/interview_questions", params: params.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 422 when question text is missing" do
      params = { interview_question: { category: "behavioural" } }
      post "/api/v1/interview_questions", params: params.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response["errors"]).to be_present
    end

    it "returns 422 for an invalid category" do
      params = { interview_question: { question: "Test?", category: "nonsense" } }
      post "/api/v1/interview_questions", params: params.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 422 when both job_id and organisation_id are set" do
      job = create(:job, user: user)
      org = create(:organisation, user: user)
      params = { interview_question: { question: "Test?", category: "behavioural", job_id: job.id, organisation_id: org.id } }
      post "/api/v1/interview_questions", params: params.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 401 without authentication" do
      post "/api/v1/interview_questions",
           params: valid_params.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── PATCH /api/v1/interview_questions/:id ────────────────────────────────────

  describe "PATCH /api/v1/interview_questions/:id" do
    it "updates the question" do
      patch "/api/v1/interview_questions/#{question.id}",
            params: { interview_question: { question: "Updated question?" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response["question"]).to eq("Updated question?")
    end

    it "clears job_id when sent as null" do
      job = create(:job, user: user)
      job_question = create(:interview_question, user: user, job: job)
      patch "/api/v1/interview_questions/#{job_question.id}",
            params: { interview_question: { job_id: nil } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(job_question.reload.job_id).to be_nil
    end

    it "returns 404 for another user's question" do
      other_question = create(:interview_question, user: create(:user))
      patch "/api/v1/interview_questions/#{other_question.id}",
            params: { interview_question: { question: "Hacked?" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 422 for an invalid category" do
      patch "/api/v1/interview_questions/#{question.id}",
            params: { interview_question: { category: "nonsense" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 422 when re-scoping to a job while pinned to other jobs" do
      job_a = create(:job, user: user)
      job_b = create(:job, user: user)
      job_b.job_interview_questions.create!(interview_question: question)
      patch "/api/v1/interview_questions/#{question.id}",
            params: { interview_question: { job_id: job_a.id } }.to_json,
            headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 401 without authentication" do
      patch "/api/v1/interview_questions/#{question.id}",
            params: { interview_question: { question: "Updated?" } }.to_json,
            headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── DELETE /api/v1/interview_questions/:id ───────────────────────────────────

  describe "DELETE /api/v1/interview_questions/:id" do
    it "deletes the question" do
      question
      expect {
        delete "/api/v1/interview_questions/#{question.id}", headers: headers
      }.to change(InterviewQuestion, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for another user's question" do
      other_question = create(:interview_question, user: create(:user))
      delete "/api/v1/interview_questions/#{other_question.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      delete "/api/v1/interview_questions/#{question.id}",
             headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
