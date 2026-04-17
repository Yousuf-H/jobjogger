# frozen_string_literal: true

class ContactJob < ApplicationRecord
  belongs_to :contact
  belongs_to :job
end
