# frozen_string_literal: true

# Immutable audit record created on every successful sign-in (email/password, Google,
# or demo). Used by the admin stats endpoint to compute session counts over time.
# record_timestamps is disabled so created_at is set explicitly at insert time.
class SignInEvent < ApplicationRecord
  self.record_timestamps = false

  belongs_to :user
end
