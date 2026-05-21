# frozen_string_literal: true

# Allow GET requests so the React SPA can navigate directly to /auth/google_oauth2.
# This is intentional for a decoupled SPA + API setup where Rails has no CSRF tokens
# to verify against anyway (ActionController::API with JWT auth).
OmniAuth.config.allowed_request_methods = %i[get post]
OmniAuth.config.silence_get_warning = true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV.fetch("GOOGLE_CLIENT_ID", ""),
           ENV.fetch("GOOGLE_CLIENT_SECRET", ""),
           scope: "email,profile",
           prompt: "select_account"
end
