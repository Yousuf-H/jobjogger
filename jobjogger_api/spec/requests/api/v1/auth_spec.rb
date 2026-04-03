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
          password_confirmation: "Password1!"
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

      it "does not expose the password in the response" do
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response.body).not_to include("password")
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
