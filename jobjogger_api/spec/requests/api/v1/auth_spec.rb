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
        expect(body.dig("data", "email")).to eq(valid_params[:user][:email])
        expect(body.dig("data", "name")).to eq(valid_params[:user][:name])
        expect(body.dig("status", "message")).to match(/signed up/i)
      end

      it "returns a JWT in the Authorization response header" do
        post "/api/v1/users", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response.headers["Authorization"]).to match(/\ABearer .+\z/)
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

      it "returns a JWT in the Authorization response header" do
        post "/api/v1/users/sign_in", params: credentials,
             headers: { "Content-Type" => "application/json" }

        expect(response.headers["Authorization"]).to match(/\ABearer .+\z/)
      end

      it "returns a decodable JWT with the correct subject" do
        post "/api/v1/users/sign_in", params: credentials,
             headers: { "Content-Type" => "application/json" }

        token = response.headers["Authorization"].split(" ").last
        secret = Rails.application.credentials.devise_jwt_secret_key ||
                 ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
        payload = JWT.decode(token, secret, true, { algorithm: "HS256" }).first

        expect(payload["sub"]).to eq(user.id.to_s)
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

      it "does not include a token in the response header on failure" do
        post "/api/v1/users/sign_in",
             params: { user: { email: "test@example.com", password: "wrong" } }.to_json,
             headers: { "Content-Type" => "application/json" }

        expect(response.headers["Authorization"]).to be_nil
      end
    end
  end

  # ── DELETE /api/v1/users/sign_out (sign out) ─────────────────────────────────

  describe "DELETE /api/v1/users/sign_out" do
    let(:user)  { create(:user) }
    let(:token) { generate_jwt_for(user) }

    context "with a valid token" do
      it "returns 200 OK" do
        delete "/api/v1/users/sign_out",
               headers: { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }

        expect(response).to have_http_status(:ok)
        expect(json_response["message"]).to match(/logged out/i)
      end

      it "adds the token's jti to the JwtDenylist" do
        expect {
          delete "/api/v1/users/sign_out",
                 headers: { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }
        }.to change(JwtDenylist, :count).by(1)
      end

      it "makes the token unusable for subsequent requests" do
        delete "/api/v1/users/sign_out",
               headers: { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }

        get "/api/v1/jobs",
            headers: { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response["error"]).to match(/revoked/i)
      end
    end

    context "without an Authorization header" do
      it "returns 401 Unauthorized" do
        delete "/api/v1/users/sign_out",
               headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response["message"]).to match(/no authorization token/i)
      end
    end

    context "with an invalid token" do
      it "returns 401 Unauthorized" do
        delete "/api/v1/users/sign_out",
               headers: { "Authorization" => "Bearer invalid.token.here",
                           "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
