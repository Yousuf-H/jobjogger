# frozen_string_literal: true

require "rails_helper"

RSpec.describe "POST /api/v1/auth/session (OAuth exchange)", type: :request do
  let(:user)    { create(:user, :google, password: nil, password_confirmation: nil) }
  let(:headers) { { "Content-Type" => "application/json" } }

  def post_exchange(token:)
    post "/api/v1/auth/session", params: { token: token }.to_json, headers: headers
  end

  # ── Valid exchange ────────────────────────────────────────────────────────────

  context "with a valid exchange token" do
    before { post_exchange(token: generate_exchange_token_for(user)) }

    it "returns 200 OK" do
      expect(response).to have_http_status(:ok)
    end

    it "sets a JWT cookie" do
      expect(cookies[:jwt]).to be_present
    end

    it "returns a user payload" do
      body = json_response
      expect(body.dig("user", "id")).to eq(user.id)
      expect(body.dig("user", "email")).to eq(user.email)
    end

    it "includes google_linked and has_password in the payload" do
      body = json_response
      expect(body.dig("user", "google_linked")).to be(true)
      expect(body.dig("user", "has_password")).to be(false)
    end
  end

  # ── Error cases ───────────────────────────────────────────────────────────────

  context "when the token is missing" do
    before { post "/api/v1/auth/session", params: {}.to_json, headers: headers }

    it "returns 400 Bad Request" do
      expect(response).to have_http_status(:bad_request)
    end

    it "does not set a JWT cookie" do
      expect(cookies[:jwt]).to be_blank
    end
  end

  context "when the token is a regular JWT (not an exchange token)" do
    before { post_exchange(token: generate_jwt_for(user)) }

    it "returns 422 Unprocessable Entity" do
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "does not set a JWT cookie" do
      expect(cookies[:jwt]).to be_blank
    end
  end

  context "when the exchange token has expired" do
    before { post_exchange(token: expired_exchange_token_for(user)) }

    it "returns 422 Unprocessable Entity" do
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "does not set a JWT cookie" do
      expect(cookies[:jwt]).to be_blank
    end
  end

  context "when the token is garbage" do
    before { post_exchange(token: "not.a.valid.jwt") }

    it "returns 422 Unprocessable Entity" do
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "does not set a JWT cookie" do
      expect(cookies[:jwt]).to be_blank
    end
  end
end
