# frozen_string_literal: true

require "rails_helper"

RSpec.describe ResumeVariant, type: :model do
  subject(:variant) { build(:resume_variant) }

  describe "associations" do
    it { is_expected.to belong_to(:resume_template) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:jobs).dependent(:nullify) }
    it { is_expected.to have_one_attached(:pdf) }
  end

  describe "cascade from template" do
    it "is destroyed when its template is destroyed" do
      template = create(:resume_template)
      create(:resume_variant, resume_template: template, user: template.user)
      expect { template.destroy }.to change(ResumeVariant, :count).by(-1)
    end
  end

  describe "nullify on variant destroy" do
    it "sets job resume_variant_id to nil when variant is destroyed" do
      variant = create(:resume_variant)
      job     = create(:job, user: variant.user, resume_variant: variant)
      variant.destroy
      expect(job.reload.resume_variant_id).to be_nil
    end
  end
end
