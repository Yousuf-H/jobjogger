# frozen_string_literal: true

# Minimal JSONAPI serializer for User. Used only where a slim user payload is needed;
# most user data is built inline via ApplicationController#user_payload instead.
class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :name, :created_at
end
