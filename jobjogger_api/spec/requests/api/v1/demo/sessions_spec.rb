# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Demo Sessions", type: :request do
  let(:json_headers) { { "Content-Type" => "application/json" } }

  describe "POST /api/v1/demo/session" do
    context "when a demo user exists" do
      let!(:demo_user) { create(:user, :demo) }

      it "returns 200 OK" do
        post "/api/v1/demo/session", headers: json_headers
        expect(response).to have_http_status(:ok)
      end

      it "returns a JWT in the Authorization response header" do
        post "/api/v1/demo/session", headers: json_headers
        expect(response.headers["Authorization"]).to match(/\ABearer .+\z/)
      end

      it "returns a decodable JWT with the demo user as subject" do
        post "/api/v1/demo/session", headers: json_headers

        token  = response.headers["Authorization"].split(" ").last
        secret = Rails.application.credentials.devise_jwt_secret_key ||
                 ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
        payload = JWT.decode(token, secret, true, { algorithm: "HS256" }).first

        expect(payload["sub"]).to eq(demo_user.id.to_s)
      end

      it "returns the demo user payload in the response body" do
        post "/api/v1/demo/session", headers: json_headers

        body = json_response
        expect(body.dig("status", "user", "id")).to eq(demo_user.id)
        expect(body.dig("status", "user", "email")).to eq(demo_user.email)
        expect(body.dig("status", "user", "name")).to eq(demo_user.name)
      end

      it "includes demo: true in the user payload" do
        post "/api/v1/demo/session", headers: json_headers
        expect(json_response.dig("status", "user", "demo")).to be(true)
      end

      it "includes a signed-in message in the response" do
        post "/api/v1/demo/session", headers: json_headers
        expect(json_response.dig("status", "message")).to match(/demo/i)
      end

      it "returns a token that can be used to authenticate subsequent requests" do
        post "/api/v1/demo/session", headers: json_headers
        token = response.headers["Authorization"]

        get "/api/v1/jobs", headers: { "Authorization" => token, "Content-Type" => "application/json" }
        expect(response).to have_http_status(:ok)
      end
    end

    context "when no demo user exists" do
      it "returns 404 Not Found" do
        post "/api/v1/demo/session", headers: json_headers
        expect(response).to have_http_status(:not_found)
      end

      it "returns an informative message" do
        post "/api/v1/demo/session", headers: json_headers
        expect(json_response.dig("status", "message")).to match(/not available/i)
      end

      it "does not set an Authorization header" do
        post "/api/v1/demo/session", headers: json_headers
        expect(response.headers["Authorization"]).to be_nil
      end
    end
  end
end
