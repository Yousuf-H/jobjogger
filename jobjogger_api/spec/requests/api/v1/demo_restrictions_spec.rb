# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Demo Account Restrictions", type: :request do
  let(:demo_user) { create(:user, :demo) }
  let(:headers)   { auth_headers_for(demo_user) }

  # ── Job limit ─────────────────────────────────────────────────────────────────

  describe "POST /api/v1/jobs (demo job limit)" do
    let(:valid_job_params) do
      {
        job: {
          company_name: Faker::Company.name,
          job_title:    Faker::Job.title,
          status:       "wishlist",
          source:       "linkedin"
        }
      }
    end

    context "when the demo user has fewer than 20 jobs" do
      before { create_list(:job, 19, user: demo_user) }

      it "allows job creation and returns 201 Created" do
        post "/api/v1/jobs", params: valid_job_params.to_json, headers: headers
        expect(response).to have_http_status(:created)
      end

      it "creates the job" do
        expect {
          post "/api/v1/jobs", params: valid_job_params.to_json, headers: headers
        }.to change(demo_user.jobs, :count).by(1)
      end
    end

    context "when the demo user already has 20 jobs" do
      before { create_list(:job, 20, user: demo_user) }

      it "returns 403 Forbidden" do
        post "/api/v1/jobs", params: valid_job_params.to_json, headers: headers
        expect(response).to have_http_status(:forbidden)
      end

      it "returns a descriptive error message" do
        post "/api/v1/jobs", params: valid_job_params.to_json, headers: headers
        expect(json_response.dig("status", "message")).to match(/limited to 20 jobs/i)
      end

      it "does not create a new job" do
        expect {
          post "/api/v1/jobs", params: valid_job_params.to_json, headers: headers
        }.not_to change(Job, :count)
      end
    end

    context "when a regular user has 20+ jobs" do
      let(:regular_user)    { create(:user) }
      let(:regular_headers) { auth_headers_for(regular_user) }

      before { create_list(:job, 20, user: regular_user) }

      it "does not apply the demo job limit" do
        expect {
          post "/api/v1/jobs", params: valid_job_params.to_json, headers: regular_headers
        }.to change(regular_user.jobs, :count).by(1)
      end
    end
  end

  # ── Profile changes ───────────────────────────────────────────────────────────

  describe "PATCH /api/v1/users (update profile)" do
    let(:update_params) { { user: { name: "New Name" } } }

    it "returns 403 Forbidden for a demo user" do
      patch "/api/v1/users", params: update_params.to_json, headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it "returns a descriptive error message" do
      patch "/api/v1/users", params: update_params.to_json, headers: headers
      expect(json_response.dig("status", "message")).to match(/cannot be modified/i)
    end

    it "does not update the demo user's name" do
      original_name = demo_user.name
      patch "/api/v1/users", params: update_params.to_json, headers: headers
      expect(demo_user.reload.name).to eq(original_name)
    end

    context "when a regular user updates their profile" do
      let(:regular_user)    { create(:user) }
      let(:regular_headers) { auth_headers_for(regular_user) }

      it "allows the update" do
        patch "/api/v1/users",
              params: { user: { name: "Updated Name" } }.to_json,
              headers: regular_headers
        expect(response).not_to have_http_status(:forbidden)
      end
    end
  end

  # ── Password change ───────────────────────────────────────────────────────────

  describe "PATCH /api/v1/users/password (update password)" do
    let(:password_params) do
      {
        user: {
          current_password: "Password1!",
          password: "NewPassword1!",
          password_confirmation: "NewPassword1!"
        }
      }
    end

    it "returns 403 Forbidden for a demo user" do
      patch "/api/v1/users/password", params: password_params.to_json, headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it "returns a descriptive error message" do
      patch "/api/v1/users/password", params: password_params.to_json, headers: headers
      expect(json_response.dig("status", "message")).to match(/cannot be modified/i)
    end
  end

  # ── Account deletion ──────────────────────────────────────────────────────────

  describe "DELETE /api/v1/users (delete account)" do
    it "returns 403 Forbidden for a demo user" do
      delete "/api/v1/users",
             params: { user: { current_password: "Password1!" } }.to_json,
             headers: headers
      expect(response).to have_http_status(:forbidden)
    end

    it "does not delete the demo user" do
      delete "/api/v1/users",
             params: { user: { current_password: "Password1!" } }.to_json,
             headers: headers
      expect(User.exists?(demo_user.id)).to be(true)
    end
  end

  # ── Avatar upload ─────────────────────────────────────────────────────────────

  describe "PATCH /api/v1/users/avatar (upload avatar)" do
    it "returns 403 Forbidden for a demo user" do
      patch "/api/v1/users/avatar", headers: headers
      expect(response).to have_http_status(:forbidden)
    end
  end

  # ── Avatar deletion ───────────────────────────────────────────────────────────

  describe "DELETE /api/v1/users/avatar (delete avatar)" do
    it "returns 403 Forbidden for a demo user" do
      delete "/api/v1/users/avatar", headers: headers
      expect(response).to have_http_status(:forbidden)
    end
  end
end
