# frozen_string_literal: true

class OauthExchange < ApplicationRecord
  belongs_to :user

  validates :jti,        presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :valid, -> { where(consumed_at: nil).where("expires_at > ?", Time.current) }

  def self.create_for(user:, session_id:)
    create!(
      jti:        SecureRandom.urlsafe_base64(32),
      user:       user,
      session_id: session_id,
      expires_at: 5.minutes.from_now
    )
  end

  # Atomically marks this entry consumed. Returns false if already consumed or expired.
  def consume!
    rows = self.class.valid.where(id: id).update_all(consumed_at: Time.current)
    rows == 1
  end
end
