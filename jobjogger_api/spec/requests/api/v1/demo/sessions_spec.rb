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

      it "sets an HttpOnly jwt cookie" do
        post "/api/v1/demo/session", headers: json_headers
        expect(cookies[:jwt]).to be_present
      end

      it "sets a cookie containing a JWT with the demo user as subject" do
        post "/api/v1/demo/session", headers: json_headers

        token  = decode_jwt_cookie
        secret = Rails.application.credentials.devise_jwt_secret_key ||
                 ENV.fetch("DEVISE_JWT_SECRET_KEY", "test_secret_key_for_rspec_at_least_32_chars")
        payload = JWT.decode(token, secret, true, { algorithm: "HS256" }).first

        expect(payload["sub"]).to eq(demo_user.id)
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

      it "sets a cookie that can be used to authenticate subsequent requests" do
        post "/api/v1/demo/session", headers: json_headers
        # cookie is carried over automatically within the same integration session
        get "/api/v1/jobs", headers: json_headers
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

      it "does not set a jwt cookie" do
        post "/api/v1/demo/session", headers: json_headers
        expect(cookies[:jwt]).to be_blank
      end
    end
  end
end
