# frozen_string_literal: true

# OmniAuth 2 defaults request_validation_phase to AuthenticityTokenProtection, which
# expects a session-based CSRF token. ActionController::API never issues those, so we
# replace it with an Origin check instead. Browsers always include the Origin header on
# cross-origin POSTs (Fetch spec §4.4), so any forged cross-site initiation is rejected.
# Same-origin requests and requests with no Origin header (e.g. direct navigation) are
# allowed through. This is necessary because production JWT cookies are SameSite=None
# and would otherwise be sent on cross-site POSTs to /auth/google_oauth2.
OmniAuth.config.request_validation_phase = proc do |env|
  origin = env["HTTP_ORIGIN"]
  next if origin.blank?

  allowed = ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  raise OmniAuth::AuthenticityError, "Origin not allowed" unless origin == allowed
end

# On failure (user cancels, provider error), redirect to the frontend sign-in page.
OmniAuth.config.on_failure = proc do |env|
  frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:5173")
  [ 302, { "Location" => "#{frontend_url}/signin?oauth_error=true", "Content-Type" => "text/html" }, [] ]
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV.fetch("GOOGLE_CLIENT_ID", ""),
           ENV.fetch("GOOGLE_CLIENT_SECRET", ""),
           scope: "email,profile",
           prompt: "select_account"
end
