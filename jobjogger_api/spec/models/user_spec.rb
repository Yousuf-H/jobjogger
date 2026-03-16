# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to have_many(:jobs).dependent(:destroy) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_length_of(:name).is_at_least(2) }

    context "name format" do
      it "is invalid when name is only whitespace" do
        user = build(:user, name: "   ")
        expect(user).not_to be_valid
        expect(user.errors[:name]).to be_present
      end

      it "is invalid when name has fewer than 2 non-whitespace characters" do
        user = build(:user, name: "a")
        expect(user).not_to be_valid
      end

      it "is valid with a regular full name" do
        user = build(:user, name: "Jane Doe")
        expect(user).to be_valid
      end

      it "is valid with a two-character name" do
        user = build(:user, name: "Jo")
        expect(user).to be_valid
      end
    end

    context "email validations (via Devise)" do
      it "is invalid without an email" do
        user = build(:user, email: nil)
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it "is invalid with a duplicate email" do
        create(:user, email: "dup@example.com")
        user = build(:user, email: "dup@example.com")
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it "is invalid with a malformed email" do
        user = build(:user, email: "not-an-email")
        expect(user).not_to be_valid
      end
    end

    context "password validations (via Devise)" do
      it "is invalid without a password" do
        user = build(:user, password: nil, password_confirmation: nil)
        expect(user).not_to be_valid
      end

      it "is invalid when password_confirmation doesn't match" do
        user = build(:user, password: "Password1!", password_confirmation: "different")
        expect(user).not_to be_valid
        expect(user.errors[:password_confirmation]).to be_present
      end

      it "is invalid when password is shorter than Devise minimum" do
        user = build(:user, password: "short", password_confirmation: "short")
        expect(user).not_to be_valid
      end
    end
  end

  # ── Devise JWT ───────────────────────────────────────────────────────────────

  describe "JWT configuration" do
    it "uses JwtDenylist as the revocation strategy" do
      expect(User.jwt_revocation_strategy).to eq(JwtDenylist)
    end
  end

  # ── Persistence ──────────────────────────────────────────────────────────────

  describe "persistence" do
    it "can be created with valid attributes" do
      user = build(:user)
      expect { user.save! }.to change(User, :count).by(1)
    end

    it "cascades destroy to associated jobs" do
      user = create(:user, :with_jobs)
      job_ids = user.jobs.pluck(:id)

      expect { user.destroy }.to change(Job, :count).by(-3)
      expect(Job.where(id: job_ids)).to be_empty
    end
  end
end
