# frozen_string_literal: true

require "rails_helper"

RSpec.describe SignInEvent, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "database" do
    it "has an index on created_at" do
      expect(ActiveRecord::Base.connection.index_exists?(:sign_in_events, :created_at)).to be true
    end
  end
end
