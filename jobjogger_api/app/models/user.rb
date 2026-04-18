class User < ApplicationRecord
  has_many :jobs, dependent: :destroy
  has_one_attached :avatar
  has_many :organisations, dependent: :destroy
  has_many :contacts, dependent: :destroy
  has_many :interview_questions, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :name, presence: true, length: { minimum: 2 }
  validates :terms_agreed_at, presence: true, on: :create
  validates :name, format: {
    with: /\A[^[:space:]]+.*[^[:space:]]+\z/,
    message: "must contain at least 2 non-whitespace characters"
  }, if: -> { name.present? && name.length >= 2 }
end
