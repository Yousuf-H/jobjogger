# frozen_string_literal: true

class Api::V1::Demo::SessionsController < ApplicationController
  def create
    demo_user = User.find_by(demo: true)

    if demo_user.nil?
      render json: { status: { message: "Demo account not available." } },
            status: :not_found
      return
    end

    token = Warden::JWTAuth::UserEncoder.new.call(demo_user, :user, nil).first

    response.set_header('Authorization', "Bearer #{token}")

    render json: {
      status: {
        code: 200,
        message: "Signed in as demo user.",
        user: user_payload(demo_user)
      }
    }, status: :ok
  end
end