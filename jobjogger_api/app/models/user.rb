class User < ApplicationRecord
  has_many :jobs, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :sign_in_events, dependent: :destroy
  has_one_attached :avatar
  has_many :organisations, dependent: :destroy
  has_many :contacts, dependent: :destroy
  has_many :interview_questions, dependent: :destroy
  has_many :resume_templates, dependent: :destroy
  has_many :resume_variants, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :name, presence: true, length: { minimum: 2 }
  validates :default_follow_up_days, numericality: { only_integer: true, in: 0..365 }
  validates :terms_agreed_at, presence: true, on: :create
  validates :name, format: {
    with: /\A[^[:space:]]+.*[^[:space:]]+\z/,
    message: "must contain at least 2 non-whitespace characters"
  }, if: -> { name.present? && name.length >= 2 }

  def self.from_google(auth)
    uid   = auth.uid
    email = auth.info.email
    name  = auth.info.name.presence || email.split("@").first

    user = find_by(google_uid: uid)
    return user if user

    user = find_by(email: email)
    if user
      user.update!(google_uid: uid)
      return user
    end

    create!(
      email:           email,
      name:            name,
      google_uid:      uid,
      terms_agreed_at: Time.current
    )
  end

  def password_required?
    # Allow Google-only users to be persisted without a password, but still
    # run Devise's confirmation validation when a password is actively being set.
    return false if google_uid.present? && password.blank?
    super
  end
end
