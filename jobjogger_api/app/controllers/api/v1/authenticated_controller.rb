# frozen_string_literal: true

# @api Base for all authenticated API controllers. Runs JWT cookie authentication
# before every action via JwtAuthenticatable.
class Api::V1::AuthenticatedController < ApplicationController
  include JwtAuthenticatable

  before_action :authenticate_user!
end