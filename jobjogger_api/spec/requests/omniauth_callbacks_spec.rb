# frozen_string_literal: true

require "rails_helper"

RSpec.describe "OmniAuth callbacks", type: :request do
  let(:google_auth) do
    OmniAuth::AuthHash.new(
      "uid"  => "google-uid-123",
      "info" => { "email" => "oauth@example.com", "name" => "OAuth User" }
    )
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google_oauth2] = google_auth
  end

  after do
    OmniAuth.config.test_mode = false
    OmniAuth.config.mock_auth.delete(:google_oauth2)
  end

  # Reads the jti from the redirect Location header and retrieves the cache entry.
  def exchange_entry_from_redirect
    uri = URI.parse(response.location)
    jti = URI.decode_www_form(uri.query || "").to_h["jti"]
    return nil if jti.blank?

    Rails.cache.read("oauth_exchange:#{jti}")
  end

  # ── Origin validation (request phase) ────────────────────────────────────────

  describe "POST /auth/google_oauth2 (request phase)" do
    context "when the Origin header is a foreign site" do
      it "does not initiate OAuth (redirects to failure)" do
        post "/auth/google_oauth2", headers: { "Origin" => "https://evil.example.com" }
        expect(response).to be_redirect
        expect(response.location).to match(%r{/signin\?oauth_error=true})
      end
    end

    context "when the Origin header matches FRONTEND_URL" do
      it "allows the request through" do
        post "/auth/google_oauth2", headers: { "Origin" => ENV.fetch("FRONTEND_URL", "http://localhost:5173") }
        follow_redirect!
        expect(response.location).to match(%r{/auth/callback\?jti=})
      end
    end

    context "when no Origin header is present" do
      it "allows the request through" do
        post "/auth/google_oauth2"
        follow_redirect!
        expect(response.location).to match(%r{/auth/callback\?jti=})
      end
    end
  end

  # ── Sign-in flow ──────────────────────────────────────────────────────────────

  describe "GET /auth/google_oauth2/callback (sign-in)" do
    def make_signin_request
      post "/auth/google_oauth2"
      follow_redirect!
    end

    context "when no matching user exists" do
      it "creates a new user" do
        expect { make_signin_request }.to change(User, :count).by(1)
      end

      it "redirects to /auth/callback with a jti param" do
        make_signin_request
        expect(response.location).to match(%r{/auth/callback\?jti=})
      end

      it "writes a cache entry for the new user bound to the session" do
        make_signin_request
        entry = exchange_entry_from_redirect
        expect(entry).to be_present
        expect(User.exists?(entry[:user_id])).to be(true)
        expect(entry[:session_id]).to be_present
      end
    end

    context "when a user with the same google_uid already exists" do
      let!(:existing_user) { create(:user, :google, google_uid: "google-uid-123") }

      it "does not create a new user" do
        expect { make_signin_request }.not_to change(User, :count)
      end

      it "writes a cache entry for the existing user" do
        make_signin_request
        entry = exchange_entry_from_redirect
        expect(entry[:user_id]).to eq(existing_user.id)
      end
    end

    context "when a user with the same email exists but no google_uid" do
      let!(:email_user) { create(:user, email: "oauth@example.com") }

      it "does not create a new user" do
        expect { make_signin_request }.not_to change(User, :count)
      end

      it "links the google_uid to the existing user" do
        make_signin_request
        expect(email_user.reload.google_uid).to eq("google-uid-123")
      end

      it "writes a cache entry for that user" do
        make_signin_request
        entry = exchange_entry_from_redirect
        expect(entry[:user_id]).to eq(email_user.id)
      end
    end
  end

  # ── Link flow ─────────────────────────────────────────────────────────────────

  describe "GET /auth/google_oauth2/callback (link)" do
    def make_link_request
      post "/auth/google_oauth2?link=true"
      follow_redirect!
    end

    context "when no JWT cookie is present" do
      it "redirects to /signin" do
        make_link_request
        expect(response.location).to match(%r{/signin})
      end
    end

    context "when the authenticated user is a demo account" do
      let(:demo_user) { create(:user, :demo) }
      before { auth_headers_for(demo_user) }

      it "redirects to /profile?oauth_error=demo_account" do
        make_link_request
        expect(response.location).to match(%r{/profile\?oauth_error=demo_account})
      end

      it "does not update the demo user's google_uid" do
        expect { make_link_request }.not_to change { demo_user.reload.google_uid }
      end
    end

    context "when the google_uid is already linked to a different account" do
      let(:current_user) { create(:user) }
      let!(:other_user)  { create(:user, :google, google_uid: "google-uid-123") }
      before { auth_headers_for(current_user) }

      it "redirects to /profile?oauth_error=google_taken" do
        make_link_request
        expect(response.location).to match(%r{/profile\?oauth_error=google_taken})
      end

      it "does not update the current user's google_uid" do
        expect { make_link_request }.not_to change { current_user.reload.google_uid }
      end
    end

    context "when the link is valid" do
      let(:current_user) { create(:user) }
      before { auth_headers_for(current_user) }

      it "updates the user's google_uid" do
        make_link_request
        expect(current_user.reload.google_uid).to eq("google-uid-123")
      end

      it "redirects to /auth/callback with redirect=/profile" do
        make_link_request
        expect(response.location).to match(%r{/auth/callback\?redirect=/profile})
      end

      it "does not write a cache exchange entry (existing session is reused)" do
        make_link_request
        expect(exchange_entry_from_redirect).to be_nil
      end
    end
  end
end
