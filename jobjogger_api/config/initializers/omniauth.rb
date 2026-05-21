# frozen_string_literal: true

# Allow GET requests so the React SPA can navigate directly to /auth/google_oauth2.
# This is intentional for a decoupled SPA + API setup where Rails has no CSRF tokens
# to verify against anyway (ActionController::API with JWT auth).
OmniAuth.config.allowed_request_methods = %i[get post]
OmniAuth.config.silence_get_warning = true

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
