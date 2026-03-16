# JobJogger API – RSpec Test Suite

This directory contains the full RSpec test suite for the JobJogger Rails 8 API.

---

## Stack

| Tool | Purpose |
|---|---|
| [RSpec Rails](https://github.com/rspec/rspec-rails) | Test framework |
| [FactoryBot Rails](https://github.com/thoughtbot/factory_bot_rails) | Test data factories |
| [Faker](https://github.com/faker-ruby/faker) | Realistic fake data |
| [Shoulda Matchers](https://github.com/thoughtbot/shoulda-matchers) | One-liner matchers for validations & associations |
| [SimpleCov](https://github.com/simplecov-ruby/simplecov) | Code coverage reporting |

---

## Setup

### 1. Install dependencies

```bash
cd jobjogger_api
bundle install
```

### 2. Prepare the test database

```bash
bin/rails db:test:prepare
# or
RAILS_ENV=test bin/rails db:create db:schema:load
```

### 3. Set the JWT secret

The test suite needs the same secret used to sign JWT tokens. Add it to your
`.env` file (which is loaded automatically in the test environment via
`dotenv-rails`):

```
DEVISE_JWT_SECRET_KEY=a_long_random_secret_at_least_32_chars_long
```

> You can generate one with `rails secret`.

---

## Running Tests

### All specs

```bash
bundle exec rspec
```

### A specific file

```bash
bundle exec rspec spec/models/job_spec.rb
bundle exec rspec spec/requests/api/v1/jobs_spec.rb
```

### A specific example (by line number)

```bash
bundle exec rspec spec/models/job_spec.rb:42
```

### By tag

```bash
# Run only focused examples
bundle exec rspec --tag focus

# Exclude slow examples
bundle exec rspec --tag ~slow
```

### With detailed output

```bash
bundle exec rspec --format documentation
```

### With code coverage

Coverage is generated automatically on every run. Open the report after:

```bash
bundle exec rspec && open coverage/index.html
```

---

## Directory Structure

```
spec/
├── factories/
│   ├── jobs.rb                  # Job factory with status/source/priority traits
│   ├── jwt_denylists.rb         # JwtDenylist factory
│   ├── timeline_entries.rb      # TimelineEntry factory with entry_type traits
│   └── users.rb                 # User (Devise) factory
│
├── models/
│   ├── job_spec.rb              # Validations, enums, scopes, callbacks
│   ├── jwt_denylist_spec.rb     # Revocation strategy, DB constraints
│   ├── timeline_entry_spec.rb   # Validations, status_change guard
│   └── user_spec.rb             # Validations, associations, Devise JWT
│
├── requests/
│   └── api/
│       └── v1/
│           ├── auth_spec.rb             # Sign up / sign in / sign out
│           ├── jobs_spec.rb             # CRUD + archive/unarchive + filters
│           └── timeline_entries_spec.rb # Create / update / destroy
│
├── support/
│   ├── auth_helpers.rb                          # JWT generation & auth header helpers
│   └── shared_examples/
│       └── authenticated_endpoint.rb            # Reusable auth guard examples
│
├── rails_helper.rb              # Rails + RSpec + Shoulda Matchers config
├── spec_helper.rb               # Core RSpec config + SimpleCov
└── README.md                    # This file
```

---

## Conventions

### Factories

- Factories live in `spec/factories/` and are auto-loaded by FactoryBot.
- Use **traits** to build variants rather than creating multiple factories:

  ```ruby
  create(:job, :applied, :high_priority, :overdue)
  ```

- Use `build` when you only need an in-memory object (no DB hit):

  ```ruby
  build(:user, email: "custom@example.com")
  ```

- Use `create_list` to create multiple records at once:

  ```ruby
  create_list(:job, 5, :wishlist, user: user)
  ```

### Request specs

- Always call `auth_headers_for(user)` for authenticated requests. This helper
  (defined in `spec/support/auth_helpers.rb`) generates a valid signed JWT and
  returns the full headers hash.
- Send JSON bodies with `.to_json` and include `"Content-Type" => "application/json"`.
- Parse the response body via the `json_response` helper:

  ```ruby
  expect(json_response["id"]).to eq(job.id)
  ```

### JWT helpers (`spec/support/auth_helpers.rb`)

| Helper | Returns |
|---|---|
| `auth_headers_for(user)` | Headers hash with valid `Authorization: Bearer …` |
| `generate_jwt_for(user)` | Raw JWT string for the user |
| `expired_jwt_for(user)` | JWT with `exp` in the past |
| `invalid_jwt_for(user)` | JWT signed with wrong secret |
| `revoke_token(token)` | Inserts the token's jti into JwtDenylist |
| `json_response` | `JSON.parse(response.body)` |

### Shared examples

`spec/support/shared_examples/authenticated_endpoint.rb` provides reusable
contexts. Call them from any request spec:

```ruby
describe "GET /api/v1/jobs" do
  let(:make_request_without_token)  { -> { get "/api/v1/jobs", headers: {} } }
  let(:make_request_with_invalid_token) { ... }
  # …

  include_examples "requires authentication"
end
```

---

## Adding New Tests

### Adding a new model spec

1. Create `spec/models/my_model_spec.rb`.
2. Start with `require "rails_helper"` and `RSpec.describe MyModel, type: :model`.
3. Use Shoulda Matchers for validations and associations.
4. Group examples with `describe` (method/feature) and `context` (condition).

### Adding a new request spec

1. Create `spec/requests/api/v1/my_resource_spec.rb`.
2. Define `let(:user)` and `let(:headers) { auth_headers_for(user) }`.
3. Test the happy path, validation failures, authentication, and user-scoping.

### Adding a new factory

1. Create or open the appropriate file in `spec/factories/`.
2. Use `Faker` for realistic data. Avoid hard-coded strings in the default factory.
3. Use `trait` blocks for variants; keep the base factory valid.

---

## Coverage Goals

| Layer | Target |
|---|---|
| Models | ≥ 95% |
| Controllers | ≥ 90% |
| Overall | ≥ 80% |

SimpleCov will **fail the test run** if overall coverage drops below 80%.
The threshold is configured in `spec/spec_helper.rb`.

---

## Useful Commands

```bash
# Check test database is up to date
bin/rails db:test:prepare

# Run RSpec with coverage open in browser
bundle exec rspec && open coverage/index.html

# Run only model specs
bundle exec rspec spec/models

# Run only request specs
bundle exec rspec spec/requests

# Run in parallel (requires parallel_tests gem)
bundle exec parallel_rspec spec/

# List all example descriptions
bundle exec rspec --dry-run --format documentation
```
