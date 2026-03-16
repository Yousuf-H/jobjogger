# frozen_string_literal: true

require "rails_helper"

RSpec.describe JwtDenylist, type: :model do
  describe "revocation strategy" do
    it "includes the Devise JWT Denylist strategy" do
      expect(JwtDenylist).to include(Devise::JWT::RevocationStrategies::Denylist)
    end
  end

  describe "database constraints" do
    it "requires a jti" do
      entry = JwtDenylist.new(jti: nil, exp: 1.hour.from_now)
      expect { entry.save!(validate: false) }.to raise_error(ActiveRecord::NotNullViolation)
    end

    it "enforces uniqueness of jti at the database level" do
      jti = SecureRandom.uuid
      JwtDenylist.create!(jti: jti, exp: 1.hour.from_now)
      expect {
        JwtDenylist.create!(jti: jti, exp: 2.hours.from_now)
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe "factory" do
    it "creates a valid denylist entry" do
      entry = create(:jwt_denylist)
      expect(entry).to be_persisted
      expect(entry.jti).to be_present
      expect(entry.exp).to be_future
    end

    it "creates an expired denylist entry with the :expired_token trait" do
      entry = create(:jwt_denylist, :expired_token)
      expect(entry.exp).to be_past
    end
  end

  describe "token lookup" do
    it "can find a denied token by its jti" do
      jti   = SecureRandom.uuid
      entry = create(:jwt_denylist, jti: jti)

      expect(JwtDenylist.find_by(jti: jti)).to eq(entry)
    end

    it "returns nil for a jti not in the denylist" do
      expect(JwtDenylist.find_by(jti: SecureRandom.uuid)).to be_nil
    end
  end
end
