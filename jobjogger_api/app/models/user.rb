class User < ApplicationRecord
  has_many :jobs, dependent: :destroy
  devise :database_authenticatable, :registerable,
       :recoverable, :rememberable, :validatable,
       :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
end
