# frozen_string_literal: true

require "simplecov"

SimpleCov.start "rails" do
  add_filter "/spec/"
  add_filter "/config/"
  add_filter "/db/"
  add_filter "/bin/"
  add_filter "/vendor/"

  add_group "Models", "app/models"
  add_group "Controllers", "app/controllers"
  add_group "Serializers", "app/serializers"

  minimum_coverage 80
end

RSpec.configure do |config|
  # Expect syntax only (no `should`)
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups

  # Run specs in random order to surface order dependencies
  config.order = :random
  Kernel.srand config.seed

  # Print the 10 slowest examples
  config.profile_examples = 10

  # Abort after first failure when running with --fail-fast
  config.filter_run_when_matching :focus
end
