# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Me API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # ── GET /api/v1/users/me ─────────────────────────────────────────────────────

  describe "GET /api/v1/users/me" do
    context "with a valid token" do
      it "returns 200 OK" do
        get "/api/v1/users/me", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "returns the current user's profile" do
        get "/api/v1/users/me", headers: headers
        body = json_response["user"]
        expect(body["id"]).to eq(user.id)
        expect(body["email"]).to eq(user.email)
        expect(body).to include("terms_agreed_at")
      end
    end

    context "without authentication" do
      it "returns 401" do
        get "/api/v1/users/me", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── PATCH /api/v1/users/me/accept_terms ──────────────────────────────────────

  describe "PATCH /api/v1/users/me/accept_terms" do
    context "when the user has not yet agreed to terms" do
      let(:user) do
        u = create(:user)
        u.update_column(:terms_agreed_at, nil)
        u
      end

      it "returns 200 OK" do
        patch "/api/v1/users/me/accept_terms", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "sets terms_agreed_at on the user" do
        expect {
          patch "/api/v1/users/me/accept_terms", headers: headers
        }.to change { user.reload.terms_agreed_at }.from(nil)
      end

      it "returns the updated user with terms_agreed_at set" do
        patch "/api/v1/users/me/accept_terms", headers: headers
        body = json_response["user"]
        expect(body["terms_agreed_at"]).not_to be_nil
      end
    end

    context "when the user has already agreed to terms" do
      let(:agreed_at) { 1.day.ago }
      let(:user) { create(:user, terms_agreed_at: agreed_at) }

      it "returns 200 OK" do
        patch "/api/v1/users/me/accept_terms", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "does not overwrite the existing terms_agreed_at" do
        patch "/api/v1/users/me/accept_terms", headers: headers
        expect(user.reload.terms_agreed_at).to be_within(1.second).of(agreed_at)
      end
    end

    context "without authentication" do
      it "returns 401" do
        patch "/api/v1/users/me/accept_terms", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
