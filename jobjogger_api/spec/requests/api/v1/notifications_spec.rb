# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Notifications API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # ── GET /api/v1/notifications ─────────────────────────────────────────────────

  describe "GET /api/v1/notifications" do
    include_examples "requires authentication" do
      let(:make_request_without_cookie)      { -> { get "/api/v1/notifications" } }
      let(:make_request_with_expired_cookie) { -> { set_auth_cookie(expired_jwt_for(user)); get "/api/v1/notifications" } }
    end

    before { create_list(:notification, 3, user: user) }

    it "returns the user's notifications" do
      get "/api/v1/notifications", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response["notifications"].size).to eq(3)
    end

    it "includes unread_count in meta" do
      get "/api/v1/notifications", headers: headers
      expect(json_response.dig("meta", "unread_count")).to eq(3)
    end

    it "does not return another user's notifications" do
      create(:notification, user: create(:user))
      get "/api/v1/notifications", headers: headers
      expect(json_response["notifications"].size).to eq(3)
    end

    it "returns at most 20 notifications" do
      create_list(:notification, 20, user: user)
      get "/api/v1/notifications", headers: headers
      expect(json_response["notifications"].size).to eq(20)
    end

    it "returns notifications in descending created_at order" do
      Notification.where(user: user).delete_all
      old_n  = create(:notification, user: user, created_at: 2.hours.ago)
      new_n  = create(:notification, user: user, created_at: 1.minute.ago)
      get "/api/v1/notifications", headers: headers
      ids = json_response["notifications"].map { |n| n["id"] }
      expect(ids).to eq([ new_n.id, old_n.id ])
    end
  end

  # ── PATCH /api/v1/notifications/:id/read ─────────────────────────────────────

  describe "PATCH /api/v1/notifications/:id/read" do
    let!(:notification) { create(:notification, user: user) }

    it "marks the notification as read" do
      expect {
        patch "/api/v1/notifications/#{notification.id}/read", headers: headers
      }.to change { notification.reload.read_at }.from(nil)

      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for another user's notification" do
      other = create(:notification, user: create(:user))
      patch "/api/v1/notifications/#{other.id}/read", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── PATCH /api/v1/notifications/read_all ─────────────────────────────────────

  describe "PATCH /api/v1/notifications/read_all" do
    before { create_list(:notification, 3, user: user) }

    it "marks all unread notifications as read" do
      patch "/api/v1/notifications/read_all", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(current_user_notifications_unread_count).to eq(0)
    end

    it "does not affect another user's notifications" do
      other_notification = create(:notification, user: create(:user))
      patch "/api/v1/notifications/read_all", headers: headers
      expect(other_notification.reload.read_at).to be_nil
    end

    def current_user_notifications_unread_count
      Notification.where(user: user, read_at: nil).count
    end
  end
end
