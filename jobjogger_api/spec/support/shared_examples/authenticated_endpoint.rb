# frozen_string_literal: true

# Shared examples for endpoints that require a valid JWT cookie.
#
# Usage:
#   include_examples "requires authentication" do
#     let(:make_request_without_cookie) { -> { get "/api/v1/jobs" } }
#     let(:make_request_with_expired_cookie) { -> { ... } }
#   end
#
# The caller must define the make_request_* lets.
RSpec.shared_examples "requires authentication" do
  context "when no jwt cookie is provided" do
    before { make_request_without_cookie.call }

    it "returns 401 Unauthorized" do
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns an error message" do
      expect(json_response.dig("status", "message")).to be_present
    end
  end

  context "when an expired jwt cookie is provided" do
    before { make_request_with_expired_cookie.call }

    it "returns 401 Unauthorized" do
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns a session-expired error" do
      expect(json_response.dig("status", "message")).to match(/expired/i)
    end
  end
end

# Shared examples for verifying that a resource is scoped to the current user.
RSpec.shared_examples "user-scoped resource" do
  context "when accessing another user's resource" do
    before { make_request_for_other_user.call }

    it "returns 404 Not Found" do
      expect(response).to have_http_status(:not_found)
    end
  end
end
