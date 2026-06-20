# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Registrations API", type: :request do
  # ── PATCH /api/v1/users (profile fields) ────────────────────────────────────

  describe "PATCH /api/v1/users" do
    let(:user)    { create(:user) }
    let(:headers) { auth_headers_for(user) }

    it_behaves_like "requires authentication" do
      let(:make_request_without_cookie)      { -> { patch "/api/v1/users", headers: { "Content-Type" => "application/json" }, params: { user: { name: "Test" } }.to_json } }
      let(:make_request_with_expired_cookie) do
        set_auth_cookie(expired_jwt_for(user))
        -> { patch "/api/v1/users", headers: { "Content-Type" => "application/json" }, params: { user: { name: "Test" } }.to_json }
      end
    end

    context "when updating new profile fields" do
      let(:params) do
        {
          user: {
            name: user.name,
            email: user.email,
            phone: "+61 400 111 222",
            location: "Melbourne, VIC",
            job_title: "Software Engineer",
            linkedin_url: "https://linkedin.com/in/testuser"
          }
        }.to_json
      end

      it "returns 200 OK" do
        patch "/api/v1/users", headers: headers, params: params
        expect(response).to have_http_status(:ok)
      end

      it "persists phone, location, job_title, and linkedin_url" do
        patch "/api/v1/users", headers: headers, params: params
        user.reload
        expect(user.phone).to eq("+61 400 111 222")
        expect(user.location).to eq("Melbourne, VIC")
        expect(user.job_title).to eq("Software Engineer")
        expect(user.linkedin_url).to eq("https://linkedin.com/in/testuser")
      end

      it "returns all four new fields in the user payload" do
        patch "/api/v1/users", headers: headers, params: params
        body = json_response["user"]
        expect(body["phone"]).to eq("+61 400 111 222")
        expect(body["location"]).to eq("Melbourne, VIC")
        expect(body["job_title"]).to eq("Software Engineer")
        expect(body["linkedin_url"]).to eq("https://linkedin.com/in/testuser")
      end

      it "allows fields to be cleared by sending null" do
        user.update!(phone: "+61 400 000 000", location: "Sydney")
        patch "/api/v1/users", headers: headers, params: { user: { name: user.name, email: user.email, phone: nil, location: nil } }.to_json
        user.reload
        expect(user.phone).to be_nil
        expect(user.location).to be_nil
      end
    end

    context "when the user is a demo account" do
      let(:demo_user) { create(:user, :demo) }
      let(:headers)   { auth_headers_for(demo_user) }

      it "returns 403 Forbidden" do
        patch "/api/v1/users", headers: headers, params: { user: { name: "New Name" } }.to_json
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  # ── PATCH /api/v1/users/notifications ───────────────────────────────────────

  describe "PATCH /api/v1/users/notifications" do
    let(:user)    { create(:user) }
    let(:headers) { auth_headers_for(user) }

    it_behaves_like "requires authentication" do
      let(:make_request_without_cookie)      { -> { patch "/api/v1/users/notifications", headers: { "Content-Type" => "application/json" }, params: { user: { notify_follow_up_reminders: false } }.to_json } }
      let(:make_request_with_expired_cookie) do
        set_auth_cookie(expired_jwt_for(user))
        -> { patch "/api/v1/users/notifications", headers: { "Content-Type" => "application/json" }, params: { user: { notify_follow_up_reminders: false } }.to_json }
      end
    end

    context "when the user is a demo account" do
      let(:demo_user) { create(:user, :demo) }
      let(:headers)   { auth_headers_for(demo_user) }

      it "returns 403 Forbidden" do
        patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: false } }.to_json
        expect(response).to have_http_status(:forbidden)
      end

      it "does not change notification preferences" do
        expect {
          patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: false } }.to_json
        }.not_to change { demo_user.reload.notify_follow_up_reminders }
      end
    end

    context "when disabling follow-up reminders" do
      it "returns 200 OK" do
        patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: false } }.to_json
        expect(response).to have_http_status(:ok)
      end

      it "persists the preference" do
        expect {
          patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: false } }.to_json
        }.to change { user.reload.notify_follow_up_reminders }.from(true).to(false)
      end

      it "does not change interview reminders" do
        expect {
          patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: false } }.to_json
        }.not_to change { user.reload.notify_interview_reminders }
      end

      it "returns the updated preference in the user payload" do
        patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: false } }.to_json
        expect(json_response.dig("user", "notify_follow_up_reminders")).to be(false)
      end
    end

    context "when disabling interview reminders" do
      it "persists the preference" do
        expect {
          patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_interview_reminders: false } }.to_json
        }.to change { user.reload.notify_interview_reminders }.from(true).to(false)
      end

      it "does not change follow-up reminders" do
        expect {
          patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_interview_reminders: false } }.to_json
        }.not_to change { user.reload.notify_follow_up_reminders }
      end

      it "returns the updated preference in the user payload" do
        patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_interview_reminders: false } }.to_json
        expect(json_response.dig("user", "notify_interview_reminders")).to be(false)
      end
    end

    context "when updating both preferences together" do
      it "persists both values" do
        patch "/api/v1/users/notifications", headers: headers,
              params: { user: { notify_follow_up_reminders: false, notify_interview_reminders: false } }.to_json
        user.reload
        expect(user.notify_follow_up_reminders).to be(false)
        expect(user.notify_interview_reminders).to be(false)
      end
    end

    context "when re-enabling a preference" do
      let(:user) { create(:user, :follow_up_reminders_off) }

      it "persists the re-enabled value" do
        expect {
          patch "/api/v1/users/notifications", headers: headers, params: { user: { notify_follow_up_reminders: true } }.to_json
        }.to change { user.reload.notify_follow_up_reminders }.from(false).to(true)
      end
    end
  end

  # ── DELETE /api/v1/users/google ──────────────────────────────────────────────

  describe "DELETE /api/v1/users/google" do
    it_behaves_like "requires authentication" do
      let(:make_request_without_cookie)      { -> { delete "/api/v1/users/google", headers: { "Content-Type" => "application/json" } } }
      let(:make_request_with_expired_cookie) do
        user = create(:user, :google)
        set_auth_cookie(expired_jwt_for(user))
        -> { delete "/api/v1/users/google", headers: { "Content-Type" => "application/json" } }
      end
    end

    context "when the user is a demo account" do
      let(:demo_user) { create(:user, :demo, :google) }
      let(:headers)   { auth_headers_for(demo_user) }

      it "returns 403 Forbidden" do
        delete "/api/v1/users/google", headers: headers
        expect(response).to have_http_status(:forbidden)
      end

      it "does not remove the google_uid" do
        expect {
          delete "/api/v1/users/google", headers: headers
        }.not_to change { demo_user.reload.google_uid }
      end
    end

    context "when the user has no Google account linked" do
      let(:user)    { create(:user) }
      let(:headers) { auth_headers_for(user) }

      it "returns 422 Unprocessable Content" do
        delete "/api/v1/users/google", headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when the user has no password set" do
      let(:user)    { create(:user, :google, password: nil, password_confirmation: nil, encrypted_password: "") }
      let(:headers) { auth_headers_for(user) }

      it "returns 422 Unprocessable Content" do
        delete "/api/v1/users/google", headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "does not remove the google_uid" do
        expect {
          delete "/api/v1/users/google", headers: headers
        }.not_to change { user.reload.google_uid }
      end
    end

    context "when the user has a Google account linked and a password set" do
      let(:user)    { create(:user, :google) }
      let(:headers) { auth_headers_for(user) }

      it "returns 200 OK" do
        delete "/api/v1/users/google", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "clears the google_uid" do
        expect {
          delete "/api/v1/users/google", headers: headers
        }.to change { user.reload.google_uid }.to(nil)
      end

      it "returns google_linked: false in the user payload" do
        delete "/api/v1/users/google", headers: headers
        expect(json_response.dig("user", "google_linked")).to be(false)
      end
    end
  end
end
