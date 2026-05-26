# frozen_string_literal: true

require "rails_helper"

RSpec.describe ResumeVariant, type: :model do
  subject(:variant) { build(:resume_variant) }

  describe "associations" do
    it { is_expected.to belong_to(:resume_template) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_one_attached(:pdf) }
    # has_many :jobs (dependent: :nullify) tested in chunk 3 once resume_variant_id is on jobs
  end

  describe "cascade from template" do
    it "is destroyed when its template is destroyed" do
      template = create(:resume_template)
      create(:resume_variant, resume_template: template, user: template.user)
      expect { template.destroy }.to change(ResumeVariant, :count).by(-1)
    end
  end
end
