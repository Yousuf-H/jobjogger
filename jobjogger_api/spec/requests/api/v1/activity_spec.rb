# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Activity API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  describe "GET /api/v1/activity" do
    include_examples "requires authentication" do
      let(:make_request_without_cookie)      { -> { get "/api/v1/activity" } }
      let(:make_request_with_expired_cookie) { -> { set_auth_cookie(expired_jwt_for(user)); get "/api/v1/activity" } }
    end

    context "when authenticated" do
      let(:job) { create(:job, user: user) }

      before do
        job.update!(status: "applied")
        job.update!(status: "phone_screen")
      end

      it "returns 200 with an array" do
        get "/api/v1/activity", headers: headers
        expect(response).to have_http_status(:ok)
        expect(json_response).to be_an(Array)
      end

      it "includes company_name and job_title on each entry" do
        get "/api/v1/activity", headers: headers
        entry = json_response.first
        expect(entry).to include("company_name", "job_title", "entry_type", "occurred_at", "metadata")
        expect(entry["company_name"]).to eq(job.company_name)
        expect(entry["job_title"]).to eq(job.job_title)
      end

      it "returns entries ordered newest first" do
        get "/api/v1/activity", headers: headers
        times = json_response.map { |e| Time.parse(e["occurred_at"]) }
        expect(times).to eq(times.sort.reverse)
      end

      it "does not return entries from another user's jobs" do
        other_job = create(:job, user: create(:user))
        other_job.update!(status: "applied")

        get "/api/v1/activity", headers: headers
        returned_job_ids = json_response.map { |e| e["job_id"] }.uniq
        expect(returned_job_ids).to all(eq(job.id))
      end
    end
  end
end
