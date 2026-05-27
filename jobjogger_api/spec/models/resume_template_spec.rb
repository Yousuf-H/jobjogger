# frozen_string_literal: true

require "rails_helper"

RSpec.describe ResumeTemplate, type: :model do
  subject(:template) { build(:resume_template) }

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:resume_variants).dependent(:destroy) }
    it { is_expected.to have_one_attached(:pdf) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
  end
end
