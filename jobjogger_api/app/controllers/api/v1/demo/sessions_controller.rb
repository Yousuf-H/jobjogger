# frozen_string_literal: true

class Api::V1::Demo::SessionsController < ApplicationController
  include JwtCookieable

  def create
    demo_user = User.find_by(demo: true)

    if demo_user.nil?
      render json: { status: { message: "Demo account not available." } },
             status: :not_found
      return
    end

    demo_user.update_columns(terms_agreed_at: Time.current) if demo_user.terms_agreed_at.nil?
    demo_user.update_column(:last_sign_in_at, Time.current)
    SignInEvent.create!(user: demo_user, created_at: Time.current)
    set_jwt_cookie(generate_jwt(demo_user))

    render json: {
      status: {
        code: 200,
        message: "Signed in as demo user.",
        user: user_payload(demo_user)
      }
    }, status: :ok
  end
end
