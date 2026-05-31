Sentry.init do |config|
  config.dsn = ENV["SENTRY_DSN"]
  config.breadcrumbs_logger = [ :active_support_logger, :http_logger ]
  config.traces_sample_rate = Rails.env.production? ? 0.2 : 0.0
  config.send_default_pii = false
  config.enabled_environments = %w[production staging]
  config.release = ENV["RENDER_GIT_COMMIT"]
end
