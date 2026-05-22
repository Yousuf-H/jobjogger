# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Authentication", type: :request do
  # ── POST /api/v1/users (sign up) ─────────────────────────────────────────────

  describe "POST /api/v1/users" do
    let(:valid_params) do
      {
        user: {
          name: Faker::Name.name,
          email: Faker::Internet.unique.email,
          password: "Password1!",
          password_confirmation: "Password1!",
          agreed_to_terms: true
        }
      }
    end

    context "with valid parameters" do
      it "creates a new user" do
        expect {
          post "/api/v1/users", params: valid_params.to_json,
               headers: { "Content-Type" => "application/json" }
        }.to change(User, :count).by(1)
      end

      it "returns 200 OK" do
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:ok)
      end

      it "includes the user data in the response body" do
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }

        body = json_response
        expect(body.dig("user", "email")).to eq(valid_params[:user][:email])
        expect(body.dig("user", "name")).to eq(valid_params[:user][:name])
        expect(body.dig("status", "message")).to match(/signed up/i)
      end

      it "sets an HttpOnly jwt cookie" do
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(cookies[:jwt]).to be_present
      end

      it "does not expose the password or encrypted_password in the response" do
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }

        user_keys = json_response.dig("user")&.keys || []
        expect(user_keys).not_to include("password", "encrypted_password")
      end
    end

    context "with invalid parameters" do
      it "returns 422 when email is missing" do
        post "/api/v1/users",
             params: { user: valid_params[:user].merge(email: "") }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 422 when name is missing" do
        post "/api/v1/users",
             params: { user: valid_params[:user].merge(name: "") }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 422 when passwords don't match" do
        post "/api/v1/users",
             params: { user: valid_params[:user].merge(password_confirmation: "WrongPass1!") }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 422 when email is already taken" do
        create(:user, email: valid_params[:user][:email])
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response.dig("status", "message")).to match(/email/i)
      end

      it "does not create a user" do
        expect {
          post "/api/v1/users",
               params: { user: valid_params[:user].merge(email: "") }.to_json,
               headers: { "Content-Type" => "application/json" }
        }.not_to change(User, :count)
      end
    end
  end

  # ── POST /api/v1/users/sign_in (sign in) ─────────────────────────────────────

  describe "POST /api/v1/users/sign_in" do
    let!(:user) { create(:user, email: "test@example.com", password: "Password1!") }

    context "with valid credentials" do
      let(:credentials) do
        { user: { email: "test@example.com", password: "Password1!" } }.to_json
      end

      it "returns 200 OK" do
        post "/api/v1/users/sign_in", params: credentials,
             headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:ok)
      end

      it "returns the user payload in the response body" do
        post "/api/v1/users/sign_in", params: credentials,
             headers: { "Content-Type" => "application/json" }

        body = json_response
        expect(body.dig("status", "user", "email")).to eq("test@example.com")
        expect(body.dig("status", "user", "name")).to eq(user.name)
        expect(body.dig("status", "user", "id")).to eq(user.id)
      end

      it "sets an HttpOnly jwt cookie" do
        post "/api/v1/users/sign_in", params: credentials,
             headers: { "Content-Type" => "application/json" }

        expect(cookies[:jwt]).to be_present
      end

      it "sets a cookie containing a JWT with the correct subject" do
        post "/api/v1/users/sign_in", params: credentials,
             headers: { "Content-Type" => "application/json" }

        expect(decode_jwt_payload["sub"]).to eq(user.id)
      end
    end

    context "with invalid credentials" do
      it "returns 401 for a wrong password" do
        post "/api/v1/users/sign_in",
             params: { user: { email: "test@example.com", password: "wrong" } }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unauthorized)
      end

      it "returns 401 for an unknown email" do
        post "/api/v1/users/sign_in",
             params: { user: { email: "nobody@example.com", password: "Password1!" } }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unauthorized)
      end

      it "does not set a jwt cookie on failure" do
        post "/api/v1/users/sign_in",
             params: { user: { email: "test@example.com", password: "wrong" } }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(cookies[:jwt]).to be_blank
      end
    end
  end

  # ── PATCH /api/v1/users/password/set (set initial password) ─────────────────

  describe "PATCH /api/v1/users/password/set" do
    let(:google_user) { create(:user, :google, password: nil, password_confirmation: nil) }
    let(:headers)     { auth_headers_for(google_user) }
    let(:valid_params) do
      { user: { password: "NewPassword1!", password_confirmation: "NewPassword1!" } }.to_json
    end

    include_examples "requires authentication" do
      let(:make_request_without_cookie) do
        -> { patch "/api/v1/users/password/set", params: valid_params, headers: { "Content-Type" => "application/json" } }
      end
      let(:make_request_with_expired_cookie) do
        -> {
          set_auth_cookie(expired_jwt_for(google_user))
          patch "/api/v1/users/password/set", params: valid_params, headers: { "Content-Type" => "application/json" }
        }
      end
    end

    context "when the user already has a password" do
      let(:password_user) { create(:user) }
      let(:headers)       { auth_headers_for(password_user) }

      it "returns 422" do
        patch "/api/v1/users/password/set", params: valid_params, headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns a descriptive error" do
        patch "/api/v1/users/password/set", params: valid_params, headers: headers
        expect(json_response.dig("status", "message")).to match(/change password form/i)
      end
    end

    context "with valid params" do
      before { patch "/api/v1/users/password/set", params: valid_params, headers: headers }

      it "returns 200 OK" do
        expect(response).to have_http_status(:ok)
      end

      it "sets the user's password" do
        expect(google_user.reload.encrypted_password).to be_present
      end

      it "returns has_password: true in the payload" do
        expect(json_response.dig("user", "has_password")).to be(true)
      end
    end

    context "when the password param is blank" do
      it "returns 422 without updating encrypted_password" do
        patch "/api/v1/users/password/set",
              params: { user: { password: "", password_confirmation: "" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(google_user.reload.encrypted_password).to be_blank
      end

      it "returns 422 when the user key is present but empty" do
        patch "/api/v1/users/password/set",
              params: { user: {} }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(google_user.reload.encrypted_password).to be_blank
      end
    end

    context "when passwords do not match" do
      let(:bad_params) do
        { user: { password: "NewPassword1!", password_confirmation: "Different1!" } }.to_json
      end

      it "returns 422" do
        patch "/api/v1/users/password/set", params: bad_params, headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  # ── DELETE /api/v1/users/google (unlink Google) ──────────────────────────────

  describe "DELETE /api/v1/users/google" do
    let(:user)    { create(:user, :google) }
    let(:headers) { auth_headers_for(user) }

    include_examples "requires authentication" do
      let(:make_request_without_cookie) do
        -> { delete "/api/v1/users/google", headers: { "Content-Type" => "application/json" } }
      end
      let(:make_request_with_expired_cookie) do
        -> {
          set_auth_cookie(expired_jwt_for(user))
          delete "/api/v1/users/google", headers: { "Content-Type" => "application/json" }
        }
      end
    end

    context "when the user has no google_uid" do
      let(:user) { create(:user) }

      it "returns 422" do
        delete "/api/v1/users/google", headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when the user has google_uid but no password" do
      let(:user) { create(:user, :google, password: nil, password_confirmation: nil) }

      it "returns 422" do
        delete "/api/v1/users/google", headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "explains that a password must be set first" do
        delete "/api/v1/users/google", headers: headers
        expect(json_response.dig("status", "message")).to match(/set a password/i)
      end
    end

    context "when the user has both a google_uid and a password" do
      before { delete "/api/v1/users/google", headers: headers }

      it "returns 200 OK" do
        expect(response).to have_http_status(:ok)
      end

      it "clears the user's google_uid" do
        expect(user.reload.google_uid).to be_nil
      end

      it "returns google_linked: false in the payload" do
        expect(json_response.dig("user", "google_linked")).to be(false)
      end
    end
  end

  # ── DELETE /api/v1/users (account deletion) ───────────────────────────────────

  describe "DELETE /api/v1/users" do
    context "when the user has a password" do
      let(:user)    { create(:user, password: "Password1!") }
      let(:headers) { auth_headers_for(user) }

      it "returns 200 and deletes the account when the password is correct" do
        delete "/api/v1/users",
               params: { user: { password: "Password1!" } }.to_json,
               headers: headers
        expect(response).to have_http_status(:ok)
        expect(User.exists?(user.id)).to be(false)
      end

      it "returns 422 when the password is wrong" do
        delete "/api/v1/users",
               params: { user: { password: "WrongPass1!" } }.to_json,
               headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 400 when the password param is missing" do
        delete "/api/v1/users", params: {}.to_json, headers: headers
        expect(response).to have_http_status(:bad_request)
      end
    end

    context "when the user is Google-only (no password)" do
      let(:user)    { create(:user, :google, password: nil, password_confirmation: nil) }
      let(:headers) { auth_headers_for(user) }

      it "deletes the account without requiring a password" do
        delete "/api/v1/users", params: {}.to_json, headers: headers
        expect(response).to have_http_status(:ok)
        expect(User.exists?(user.id)).to be(false)
      end
    end
  end

  # ── DELETE /api/v1/users/sign_out (sign out) ─────────────────────────────────

  describe "DELETE /api/v1/users/sign_out" do
    let!(:user) { create(:user, email: "signout@example.com", password: "Password1!") }

    context "when signed in" do
      # Sign in via the real endpoint so the server-issued cookie (domain=localhost)
      # is stored by rack-test and can be properly cleared on sign-out.
      before do
        post "/api/v1/users/sign_in",
             params: { user: { email: "signout@example.com", password: "Password1!" } }.to_json,
             headers: { "Content-Type" => "application/json" }
      end

      it "returns 200 OK" do
        delete "/api/v1/users/sign_out",
               headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:ok)
        expect(json_response["message"]).to match(/signed out/i)
      end

      it "clears the jwt cookie" do
        delete "/api/v1/users/sign_out",
               headers: { "Content-Type" => "application/json" }

        expect(cookies[:jwt]).to be_blank
      end
    end

    context "without a jwt cookie" do
      it "returns 200 OK" do
        delete "/api/v1/users/sign_out",
               headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:ok)
      end
    end
  end
end
