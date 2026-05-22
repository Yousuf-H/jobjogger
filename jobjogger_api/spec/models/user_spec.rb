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


  # ── Google OAuth ─────────────────────────────────────────────────────────────

  describe ".from_google" do
    let(:auth) do
      OmniAuth::AuthHash.new(
        "uid"  => "google-uid-abc",
        "info" => { "email" => "google@example.com", "name" => "Google User" }
      )
    end

    context "when no user with that uid or email exists" do
      it "creates a new user" do
        expect { User.from_google(auth) }.to change(User, :count).by(1)
      end

      it "sets google_uid, email, and name from the auth hash" do
        user = User.from_google(auth)
        expect(user.google_uid).to eq("google-uid-abc")
        expect(user.email).to eq("google@example.com")
        expect(user.name).to eq("Google User")
      end

      it "sets terms_agreed_at" do
        user = User.from_google(auth)
        expect(user.terms_agreed_at).to be_present
      end

      it "falls back to the email prefix when name is blank" do
        auth["info"]["name"] = ""
        user = User.from_google(auth)
        expect(user.name).to eq("google")
      end
    end

    context "when a user with the same google_uid already exists" do
      let!(:existing) { create(:user, :google, google_uid: "google-uid-abc") }

      it "returns the existing user without creating a new one" do
        expect { User.from_google(auth) }.not_to change(User, :count)
        expect(User.from_google(auth)).to eq(existing)
      end
    end

    context "when a user with the same email exists but no google_uid" do
      let!(:existing) { create(:user, email: "google@example.com") }

      it "links the google_uid to the existing user" do
        User.from_google(auth)
        expect(existing.reload.google_uid).to eq("google-uid-abc")
      end

      it "does not create a new user" do
        expect { User.from_google(auth) }.not_to change(User, :count)
      end
    end
  end

  describe "#password_required?" do
    it "returns false for a Google-only user (no encrypted_password)" do
      user = create(:user, :google, password: nil, password_confirmation: nil)
      expect(user.password_required?).to be(false)
    end

    it "returns true for a regular email/password user" do
      user = build(:user)
      expect(user.password_required?).to be(true)
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
