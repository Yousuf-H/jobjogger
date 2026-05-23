# frozen_string_literal: true

require "rails_helper"

RSpec.describe "POST /api/v1/auth/session (OAuth exchange)", type: :request do
  let(:user)    { create(:user, :google, password: nil, password_confirmation: nil) }
  let(:headers) { { "Content-Type" => "application/json" } }

  # Simulates the server-side entry written by OmniauthCallbacksController#handle_signin.
  def write_exchange_entry(jti:, user_id:, session_id:)
    Rails.cache.write("oauth_exchange:#{jti}", { user_id: user_id, session_id: session_id }, expires_in: 5.minutes)
  end

  def current_session_id
    # Trigger a request so the session is established and its ID is readable.
    get "/up"
    request.session.id.to_s
  end

  def post_exchange(jti:)
    post "/api/v1/auth/session", params: { jti: jti }.to_json, headers: headers
  end

  # ── Valid exchange ────────────────────────────────────────────────────────────

  context "with a valid JTI and matching session" do
    let(:jti) { SecureRandom.urlsafe_base64(32) }

    before do
      sid = current_session_id
      write_exchange_entry(jti: jti, user_id: user.id, session_id: sid)
      post_exchange(jti: jti)
    end

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

    it "consumes the entry so a second exchange is rejected" do
      post_exchange(jti: jti)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  # ── Session mismatch ─────────────────────────────────────────────────────────

  context "when the JTI was issued for a different session" do
    let(:jti) { SecureRandom.urlsafe_base64(32) }

    before do
      write_exchange_entry(jti: jti, user_id: user.id, session_id: "some-other-session-id")
      post_exchange(jti: jti)
    end

    it "returns 403 Forbidden" do
      expect(response).to have_http_status(:forbidden)
    end

    it "does not set a JWT cookie" do
      expect(cookies[:jwt]).to be_blank
    end
  end

  # ── Error cases ───────────────────────────────────────────────────────────────

  context "when the JTI param is missing" do
    before { post "/api/v1/auth/session", params: {}.to_json, headers: headers }

    it "returns 400 Bad Request" do
      expect(response).to have_http_status(:bad_request)
    end
  end

  context "when the JTI does not exist in cache" do
    before { post_exchange(jti: "nonexistent-jti") }

    it "returns 422 Unprocessable Entity" do
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "does not set a JWT cookie" do
      expect(cookies[:jwt]).to be_blank
    end
  end
end
