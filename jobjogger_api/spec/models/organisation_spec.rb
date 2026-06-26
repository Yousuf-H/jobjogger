# frozen_string_literal: true

require "rails_helper"

RSpec.describe Organisation, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:jobs).dependent(:nullify) }
    it { is_expected.to have_many(:contacts).dependent(:nullify) }
    it { is_expected.to have_many(:interview_questions).dependent(:nullify) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:organisation) }

    it { is_expected.to validate_presence_of(:name) }

    context "name uniqueness per user" do
      let(:user) { create(:user) }

      it "is invalid when another organisation for the same user has the same name" do
        create(:organisation, user: user, name: "Acme Corp")
        org = build(:organisation, user: user, name: "Acme Corp")
        expect(org).not_to be_valid
        expect(org.errors[:name]).to be_present
      end

      it "is invalid regardless of case" do
        create(:organisation, user: user, name: "Acme Corp")
        org = build(:organisation, user: user, name: "acme corp")
        expect(org).not_to be_valid
      end

      it "is valid when another user has an organisation with the same name" do
        create(:organisation, user: create(:user), name: "Acme Corp")
        org = build(:organisation, user: user, name: "Acme Corp")
        expect(org).to be_valid
      end
    end

    context "size" do
      it "is valid when size is one of the allowed values" do
        Organisation::SIZES.each do |size|
          org = build(:organisation, size: size)
          expect(org).to be_valid, "expected size #{size.inspect} to be valid"
        end
      end

      it "is valid when size is nil" do
        org = build(:organisation, size: nil)
        expect(org).to be_valid
      end

      it "is invalid with an unrecognised size value" do
        org = build(:organisation, size: "huge")
        expect(org).not_to be_valid
        expect(org.errors[:size]).to be_present
      end
    end

    context "rating" do
      it "is valid with a value between 0.1 and 5.0" do
        org = build(:organisation, rating: 3.5)
        expect(org).to be_valid
      end

      it "is valid at the lower boundary of 0.1" do
        org = build(:organisation, rating: 0.1)
        expect(org).to be_valid
      end

      it "is valid at the upper boundary of 5.0" do
        org = build(:organisation, rating: 5.0)
        expect(org).to be_valid
      end

      it "is valid when rating is nil" do
        org = build(:organisation, rating: nil)
        expect(org).to be_valid
      end

      it "is invalid when rating is below 0.1" do
        org = build(:organisation, rating: 0.0)
        expect(org).not_to be_valid
        expect(org.errors[:rating]).to be_present
      end

      it "is invalid when rating exceeds 5.0" do
        org = build(:organisation, rating: 5.1)
        expect(org).not_to be_valid
        expect(org.errors[:rating]).to be_present
      end
    end

    context "aliases limit" do
      it "is valid with exactly 50 aliases" do
        org = build(:organisation, aliases: Array.new(50, "Alias"))
        expect(org).to be_valid
      end

      it "is invalid with more than 50 aliases" do
        org = build(:organisation, aliases: Array.new(51, "Alias"))
        expect(org).not_to be_valid
        expect(org.errors[:aliases]).to be_present
      end
    end
  end

  # ── Cascade behaviour ─────────────────────────────────────────────────────────

  describe "cascade on destroy" do
    let(:user) { create(:user) }
    let(:org)  { create(:organisation, user: user) }

    it "nullifies the organisation_id on associated jobs rather than deleting them" do
      job = create(:job, user: user, organisation: org)
      org.destroy
      expect(job.reload.organisation_id).to be_nil
    end

    it "nullifies the organisation_id on associated contacts rather than deleting them" do
      contact = create(:contact, user: user, organisation: org)
      org.destroy
      expect(contact.reload.organisation_id).to be_nil
    end
  end

  # ── Class methods ─────────────────────────────────────────────────────────────

  describe ".similar_to" do
    let(:user) { create(:user) }

    before do
      create(:organisation, user: user, name: "Acme Corporation")
      create(:organisation, user: user, name: "TechStart", aliases: ["TechStartup Inc"])
    end

    it "finds organisations whose name contains the search term" do
      results = Organisation.similar_to("Acme", user: user, exclude_id: nil)
      expect(results.map(&:name)).to include("Acme Corporation")
    end

    it "finds organisations whose name is a substring of the search term" do
      results = Organisation.similar_to("Acme Corporation Ltd", user: user, exclude_id: nil)
      expect(results.map(&:name)).to include("Acme Corporation")
    end

    it "finds organisations by alias match" do
      results = Organisation.similar_to("TechStartup", user: user, exclude_id: nil)
      expect(results.map(&:name)).to include("TechStart")
    end

    it "excludes the organisation with the given id" do
      acme = Organisation.find_by(name: "Acme Corporation", user: user)
      results = Organisation.similar_to("Acme", user: user, exclude_id: acme.id)
      expect(results).not_to include(acme)
    end

    it "does not return organisations belonging to other users" do
      create(:organisation, user: create(:user), name: "Acme International")
      results = Organisation.similar_to("Acme", user: user, exclude_id: nil)
      expect(results.all? { |o| o.user_id == user.id }).to be(true)
    end
  end
end
