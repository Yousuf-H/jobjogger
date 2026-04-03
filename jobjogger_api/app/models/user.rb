class User < ApplicationRecord
  has_many :jobs, dependent: :destroy
  has_one_attached :avatar

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :name, presence: true, length: { minimum: 2 }
  validates :name, format: {
    with: /\A[^[:space:]]+.*[^[:space:]]+\z/,
    message: "must contain at least 2 non-whitespace characters"
  }, if: -> { name.present? && name.length >= 2 }
end
