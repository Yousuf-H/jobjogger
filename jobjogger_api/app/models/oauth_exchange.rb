# frozen_string_literal: true

# Short-lived token used to bridge the Google OAuth redirect flow and the JWT cookie.
# After OmniAuth completes the Google callback, a JTI is stored here and the browser
# is redirected to the frontend with the JTI in the query string. The frontend then
# POSTs the JTI to Auth::CallbackController, which validates it, consumes it (one-use),
# and sets the JWT cookie. Expires after 5 minutes; consumed records are never reused.
class OauthExchange < ApplicationRecord
  belongs_to :user

  validates :jti,        presence: true, uniqueness: true
  validates :expires_at, presence: true

  # Returns only records that have not yet been consumed and have not expired.
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
