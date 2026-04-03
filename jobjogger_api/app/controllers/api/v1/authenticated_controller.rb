# frozen_string_literal: true

class Api::V1::AuthenticatedController < ApplicationController
  include JwtAuthenticatable

  before_action :authenticate_user!
end