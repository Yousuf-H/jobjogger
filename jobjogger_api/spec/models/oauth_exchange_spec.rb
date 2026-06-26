# frozen_string_literal: true

require "rails_helper"

RSpec.describe OauthExchange, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    let(:user) { create(:user) }

    it "is valid with a unique jti and a future expires_at" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      expect(exchange).to be_valid
    end

    it "is invalid without a jti" do
      exchange = OauthExchange.new(user: user, jti: nil, expires_at: 5.minutes.from_now, session_id: "sid")
      expect(exchange).not_to be_valid
      expect(exchange.errors[:jti]).to be_present
    end

    it "is invalid without an expires_at" do
      exchange = OauthExchange.new(user: user, jti: SecureRandom.urlsafe_base64(32), expires_at: nil, session_id: "sid")
      expect(exchange).not_to be_valid
      expect(exchange.errors[:expires_at]).to be_present
    end

    it "is invalid when jti is not unique" do
      existing = OauthExchange.create_for(user: user, session_id: "sid-1")
      duplicate = OauthExchange.new(
        user:       user,
        jti:        existing.jti,
        session_id: "sid-2",
        expires_at: 5.minutes.from_now
      )
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:jti]).to be_present
    end
  end

  # ── Scopes ───────────────────────────────────────────────────────────────────

  describe ".valid scope" do
    let(:user) { create(:user) }

    it "includes unexpired and unconsumed exchanges" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      expect(OauthExchange.valid).to include(exchange)
    end

    it "excludes exchanges that have expired" do
      exchange = OauthExchange.create!(
        user:       user,
        jti:        SecureRandom.urlsafe_base64(32),
        session_id: "sid",
        expires_at: 1.minute.ago
      )
      expect(OauthExchange.valid).not_to include(exchange)
    end

    it "excludes exchanges that have already been consumed" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      exchange.consume!
      expect(OauthExchange.valid).not_to include(exchange)
    end
  end

  # ── Class methods ─────────────────────────────────────────────────────────────

  describe ".create_for" do
    let(:user) { create(:user) }

    it "creates a persisted exchange" do
      expect { OauthExchange.create_for(user: user, session_id: "sid") }
        .to change(OauthExchange, :count).by(1)
    end

    it "generates a random jti" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      expect(exchange.jti).to be_present
    end

    it "sets expires_at to approximately 5 minutes from now" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      expect(exchange.expires_at).to be_within(5.seconds).of(5.minutes.from_now)
    end

    it "associates the exchange with the given user" do
      exchange = OauthExchange.create_for(user: user, session_id: "my-session")
      expect(exchange.user).to eq(user)
    end

    it "stores the provided session_id" do
      exchange = OauthExchange.create_for(user: user, session_id: "my-session")
      expect(exchange.session_id).to eq("my-session")
    end
  end

  # ── Instance methods ──────────────────────────────────────────────────────────

  describe "#consume!" do
    let(:user) { create(:user) }

    it "returns true and sets consumed_at on first call" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      result = exchange.consume!
      expect(result).to be(true)
      expect(exchange.reload.consumed_at).to be_present
    end

    it "returns false when called a second time" do
      exchange = OauthExchange.create_for(user: user, session_id: "sid")
      exchange.consume!
      expect(exchange.consume!).to be(false)
    end

    it "returns false for an already-expired exchange" do
      exchange = OauthExchange.create!(
        user:       user,
        jti:        SecureRandom.urlsafe_base64(32),
        session_id: "sid",
        expires_at: 1.minute.ago
      )
      expect(exchange.consume!).to be(false)
    end

    it "does not update consumed_at when called on an expired exchange" do
      exchange = OauthExchange.create!(
        user:       user,
        jti:        SecureRandom.urlsafe_base64(32),
        session_id: "sid",
        expires_at: 1.minute.ago
      )
      exchange.consume!
      expect(exchange.reload.consumed_at).to be_nil
    end
  end
end
