# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Interviews API", type: :request do
  let(:user)      { create(:user) }
  let(:headers)   { auth_headers_for(user) }
  let(:job)       { create(:job, :interviewing, user: user) }
  let(:interview) { create(:interview, job: job) }

  # ── GET /api/v1/jobs/:job_id/interviews ──────────────────────────────────────

  describe "GET /api/v1/jobs/:job_id/interviews" do
    before { interview }

    it "returns interviews for the job" do
      get "/api/v1/jobs/#{job.id}/interviews", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response.map { |i| i["id"] }).to include(interview.id)
    end

    it "only returns interviews for the requested job" do
      other_interview = create(:interview, job: create(:job, user: user))
      get "/api/v1/jobs/#{job.id}/interviews", headers: headers
      ids = json_response.map { |i| i["id"] }
      expect(ids).to include(interview.id)
      expect(ids).not_to include(other_interview.id)
    end

    it "returns 404 for another user's job" do
      other_job = create(:job, user: create(:user))
      get "/api/v1/jobs/#{other_job.id}/interviews", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      get "/api/v1/jobs/#{job.id}/interviews", headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/jobs/:job_id/interviews ─────────────────────────────────────

  describe "POST /api/v1/jobs/:job_id/interviews" do
    let(:valid_params) do
      {
        interview: {
          scheduled_at:   3.days.from_now.iso8601,
          interview_type: "phone_screen",
          outcome:        "pending"
        }
      }
    end

    context "with valid params" do
      it "returns 201 Created" do
        post "/api/v1/jobs/#{job.id}/interviews",
             params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:created)
      end

      it "creates an interview for the job" do
        expect {
          post "/api/v1/jobs/#{job.id}/interviews",
               params: valid_params.to_json, headers: headers
        }.to change(job.interviews, :count).by(1)
      end

      it "returns the created interview" do
        post "/api/v1/jobs/#{job.id}/interviews",
             params: valid_params.to_json, headers: headers
        expect(json_response["interview_type"]).to eq("phone_screen")
        expect(json_response["outcome"]).to eq("pending")
      end

      it "accepts all valid interview types" do
        %w[phone_screen technical panel final other].each do |type|
          params = valid_params.deep_merge(interview: { interview_type: type })
          post "/api/v1/jobs/#{job.id}/interviews",
               params: params.to_json, headers: headers
          expect(response).to have_http_status(:created), "Failed for interview_type: #{type}"
        end
      end

      it "accepts optional fields" do
        params = valid_params.deep_merge(
          interview: { format: "video", location_or_link: "https://zoom.us/j/123", prep_notes: "Do research." }
        )
        post "/api/v1/jobs/#{job.id}/interviews",
             params: params.to_json, headers: headers
        expect(response).to have_http_status(:created)
        expect(json_response["format"]).to eq("video")
        expect(json_response["prep_notes"]).to eq("Do research.")
      end
    end

    context "with invalid params" do
      it "returns 422 when scheduled_at is missing" do
        params = { interview: { interview_type: "phone_screen", outcome: "pending" } }
        post "/api/v1/jobs/#{job.id}/interviews",
             params: params.to_json, headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to be_present
      end

      it "returns 422 when interview_type is missing" do
        params = { interview: { scheduled_at: 3.days.from_now.iso8601, outcome: "pending" } }
        post "/api/v1/jobs/#{job.id}/interviews",
             params: params.to_json, headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "does not create an interview on failure" do
        expect {
          post "/api/v1/jobs/#{job.id}/interviews",
               params: { interview: { outcome: "pending" } }.to_json, headers: headers
        }.not_to change(Interview, :count)
      end
    end

    context "when the job belongs to another user" do
      let(:other_job) { create(:job, user: create(:user)) }

      it "returns 404" do
        post "/api/v1/jobs/#{other_job.id}/interviews",
             params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:not_found)
      end

      it "does not create an interview" do
        expect {
          post "/api/v1/jobs/#{other_job.id}/interviews",
               params: valid_params.to_json, headers: headers
        }.not_to change(Interview, :count)
      end
    end

    context "without authentication" do
      it "returns 401" do
        post "/api/v1/jobs/#{job.id}/interviews",
             params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── PATCH /api/v1/jobs/:job_id/interviews/:id ─────────────────────────────────

  describe "PATCH /api/v1/jobs/:job_id/interviews/:id" do
    it "returns 200 and updates the interview" do
      patch "/api/v1/jobs/#{job.id}/interviews/#{interview.id}",
            params: { interview: { outcome: "passed" } }.to_json, headers: headers
      expect(response).to have_http_status(:ok)
      expect(interview.reload.outcome).to eq("passed")
    end

    it "updates prep and debrief notes" do
      patch "/api/v1/jobs/#{job.id}/interviews/#{interview.id}",
            params: { interview: { prep_notes: "Updated prep.", debrief_notes: "It went well." } }.to_json,
            headers: headers
      expect(json_response["prep_notes"]).to eq("Updated prep.")
      expect(json_response["debrief_notes"]).to eq("It went well.")
    end

    it "returns 422 for an invalid outcome value" do
      patch "/api/v1/jobs/#{job.id}/interviews/#{interview.id}",
            params: { interview: { outcome: "unknown_value" } }.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 404 for another user's job" do
      other_interview = create(:interview, job: create(:job, user: create(:user)))
      patch "/api/v1/jobs/#{other_interview.job_id}/interviews/#{other_interview.id}",
            params: { interview: { outcome: "passed" } }.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for an interview on a different job" do
      other_job = create(:job, user: user)
      patch "/api/v1/jobs/#{other_job.id}/interviews/#{interview.id}",
            params: { interview: { outcome: "passed" } }.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without authentication" do
      patch "/api/v1/jobs/#{job.id}/interviews/#{interview.id}",
            params: { interview: { outcome: "passed" } }.to_json,
            headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── DELETE /api/v1/jobs/:job_id/interviews/:id ────────────────────────────────

  describe "DELETE /api/v1/jobs/:job_id/interviews/:id" do
    let!(:interview) { create(:interview, job: job) }

    it "returns 204 and deletes the interview" do
      expect {
        delete "/api/v1/jobs/#{job.id}/interviews/#{interview.id}", headers: headers
      }.to change(Interview, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for another user's job" do
      other_interview = create(:interview, job: create(:job, user: create(:user)))
      delete "/api/v1/jobs/#{other_interview.job_id}/interviews/#{other_interview.id}",
             headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "does not delete an interview belonging to another user" do
      other_interview = create(:interview, job: create(:job, user: create(:user)))
      expect {
        delete "/api/v1/jobs/#{other_interview.job_id}/interviews/#{other_interview.id}",
               headers: headers
      }.not_to change(Interview, :count)
    end

    it "returns 401 without authentication" do
      delete "/api/v1/jobs/#{job.id}/interviews/#{interview.id}",
             headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
