# frozen_string_literal: true

class SignInEvent < ApplicationRecord
  self.record_timestamps = false

  belongs_to :user
end
