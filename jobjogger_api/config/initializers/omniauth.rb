# frozen_string_literal: true

# OmniAuth 2 defaults request_validation_phase to AuthenticityTokenProtection, which
# expects a session-based CSRF token. ActionController::API never issues those, so we
# disable it here. Cross-site initiation risk is mitigated by requiring POST (the
# default since OmniAuth 2) and by SameSite cookie policy on the JWT cookie.
OmniAuth.config.request_validation_phase = nil

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
