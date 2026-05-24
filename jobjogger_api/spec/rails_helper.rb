# frozen_string_literal: true

require "spec_helper"
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"

# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?

require "rspec/rails"

# Load all support files
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

# Checks for pending migrations before running tests
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_paths = [Rails.root.join("spec/fixtures")]

  # Use transactional fixtures (each test runs in a transaction that is rolled back)
  config.use_transactional_fixtures = true

  # Infer spec type from file location
  config.infer_spec_type_from_file_location!

  # Filter Rails backtrace noise
  config.filter_rails_from_backtrace!

  config.include FactoryBot::Syntax::Methods
  config.include AuthHelpers, type: :request

  config.before(:each) { Rails.cache.clear }

  # Match the cookie domain used by JwtCookieable in non-production environments.
  config.before(:each, type: :request) do
    host! "localhost"
  end
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
