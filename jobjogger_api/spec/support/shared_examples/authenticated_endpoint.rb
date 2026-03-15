# frozen_string_literal: true

# Shared examples for endpoints that require a valid JWT.
#
# Usage:
#   include_examples "requires authentication" do
#     let(:make_request) { get "/api/v1/jobs", headers: {} }
#   end
#
# The caller must define `make_request` via a `let` or a `before` block.
RSpec.shared_examples "requires authentication" do
  context "when no Authorization header is provided" do
    before { make_request_without_token }

    it "returns 401 Unauthorized" do
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns an error message" do
      expect(json_response["error"]).to be_present
    end
  end

  context "when an invalid token is provided" do
    before { make_request_with_invalid_token }

    it "returns 401 Unauthorized" do
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "when an expired token is provided" do
    before { make_request_with_expired_token }

    it "returns 401 Unauthorized" do
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns a token-expired error" do
      expect(json_response["error"]).to match(/expired/i)
    end
  end

  context "when a revoked token is provided" do
    before { make_request_with_revoked_token }

    it "returns 401 Unauthorized" do
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns a token-revoked error" do
      expect(json_response["error"]).to match(/revoked/i)
    end
  end
end

# Shared examples for verifying that a resource is scoped to the current user.
RSpec.shared_examples "user-scoped resource" do
  context "when accessing another user's resource" do
    before { make_request_for_other_user }

    it "returns 404 Not Found" do
      expect(response).to have_http_status(:not_found)
    end
  end
end
