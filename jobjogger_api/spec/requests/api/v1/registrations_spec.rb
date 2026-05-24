# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Registrations API", type: :request do
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
