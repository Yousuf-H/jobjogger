# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin Stats API", type: :request do
  let(:admin)        { create(:user, :admin) }
  let(:regular_user) { create(:user) }
  let(:demo_user)    { create(:user, :demo) }
  let(:admin_headers) { auth_headers_for(admin) }

  def get_stats(period: "daily", headers: admin_headers)
    get "/api/v1/admin/stats", params: { period: period }, headers: headers
  end

  # ── Authentication ──────────────────────────────────────────────────────────

  context "when no jwt cookie is provided" do
    it "returns 401" do
      get "/api/v1/admin/stats", headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "when an expired jwt cookie is provided" do
    before { set_auth_cookie(expired_jwt_for(admin)) }

    it "returns 401" do
      get "/api/v1/admin/stats", headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── Authorisation ───────────────────────────────────────────────────────────

  context "when signed in as a non-admin user" do
    it "returns 403 Forbidden" do
      get_stats(headers: auth_headers_for(regular_user))
      expect(response).to have_http_status(:forbidden)
    end
  end

  context "when signed in as the demo user" do
    it "returns 403 Forbidden" do
      get_stats(headers: auth_headers_for(demo_user))
      expect(response).to have_http_status(:forbidden)
    end
  end

  # ── Response shape ──────────────────────────────────────────────────────────

  context "when signed in as an admin" do
    it "returns 200 OK" do
      get_stats
      expect(response).to have_http_status(:ok)
    end

    it "returns all expected top-level keys" do
      get_stats
      expect(json_response.keys).to match_array(
        %w[period totals signups_over_time sessions_over_time active_users_over_time jobs_over_time demo]
      )
    end

    it "reflects the requested period" do
      get_stats(period: "weekly")
      expect(json_response["period"]).to eq("weekly")
    end

    it "defaults to daily when period param is omitted" do
      get "/api/v1/admin/stats", headers: admin_headers
      expect(json_response["period"]).to eq("daily")
    end

    it "defaults to daily for an unrecognised period value" do
      get_stats(period: "fortnightly")
      expect(json_response["period"]).to eq("daily")
    end

    it "returns totals with users and jobs keys" do
      get_stats
      expect(json_response["totals"].keys).to match_array(%w[users jobs])
    end

    it "returns time-series arrays with date and count keys" do
      create(:sign_in_event, user: admin, created_at: 1.day.ago)

      get_stats
      point = json_response["sessions_over_time"].first
      expect(point.keys).to match_array(%w[date count])
      expect(point["date"]).to match(/\A\d{4}-\d{2}-\d{2}\z/)
    end

    it "returns demo stats with last_sign_in_at and total_jobs" do
      get_stats
      expect(json_response["demo"].keys).to match_array(%w[last_sign_in_at total_jobs])
    end
  end

  # ── Demo exclusion ──────────────────────────────────────────────────────────

  describe "demo account exclusion" do
    before do
      create(:job, user: admin)
      create(:job, user: demo_user)
    end

    it "excludes demo user from total users count" do
      get_stats
      # Only admin counts — regular_user and demo_user are not counted
      expect(json_response["totals"]["users"]).to eq(1)
    end

    it "excludes demo user's jobs from total jobs count" do
      get_stats
      expect(json_response["totals"]["jobs"]).to eq(1)
    end

    it "includes demo total_jobs in the demo section" do
      get_stats
      expect(json_response["demo"]["total_jobs"]).to eq(1)
    end
  end

  # ── Sessions (sign_in_events) ───────────────────────────────────────────────

  describe "sessions_over_time" do
    it "counts each sign-in event separately for the same user" do
      3.times { create(:sign_in_event, user: admin, created_at: 1.day.ago) }

      get_stats
      total = json_response["sessions_over_time"].sum { |p| p["count"] }
      expect(total).to eq(3)
    end

    it "excludes sign-in events belonging to the demo user" do
      create(:sign_in_event, user: admin, created_at: 1.day.ago)
      create(:sign_in_event, user: demo_user, created_at: 1.day.ago)

      get_stats
      total = json_response["sessions_over_time"].sum { |p| p["count"] }
      expect(total).to eq(1)
    end

    it "excludes events outside the window (daily = last 30 days)" do
      create(:sign_in_event, user: admin, created_at: 31.days.ago)
      create(:sign_in_event, user: admin, created_at: 1.day.ago)

      get_stats(period: "daily")
      total = json_response["sessions_over_time"].sum { |p| p["count"] }
      expect(total).to eq(1)
    end

    it "returns an empty array when there are no sign-in events" do
      get_stats
      expect(json_response["sessions_over_time"]).to be_empty
    end
  end

  # ── Signups over time ───────────────────────────────────────────────────────

  describe "signups_over_time" do
    it "counts real user signups within the window" do
      # admin was created within window; create one more real user
      create(:user, created_at: 5.days.ago)

      get_stats
      total = json_response["signups_over_time"].sum { |p| p["count"] }
      expect(total).to be >= 2
    end

    it "excludes demo user signups" do
      baseline = json_response["signups_over_time"].sum { |p| p["count"] } rescue 0

      get_stats
      total = json_response["signups_over_time"].sum { |p| p["count"] }
      # demo_user is excluded so count should not include it
      create(:user, :demo, created_at: 1.day.ago)
      get_stats
      expect(json_response["signups_over_time"].sum { |p| p["count"] }).to eq(total)
    end
  end

  # ── Jobs over time ──────────────────────────────────────────────────────────

  describe "jobs_over_time" do
    it "counts jobs created by real users within the window" do
      create(:job, user: admin, created_at: 2.days.ago)
      create(:job, user: admin, created_at: 2.days.ago)

      get_stats
      total = json_response["jobs_over_time"].sum { |p| p["count"] }
      expect(total).to eq(2)
    end

    it "excludes demo user jobs" do
      create(:job, user: admin, created_at: 1.day.ago)
      create(:job, user: demo_user, created_at: 1.day.ago)

      get_stats
      total = json_response["jobs_over_time"].sum { |p| p["count"] }
      expect(total).to eq(1)
    end
  end

  # ── Active users over time ──────────────────────────────────────────────────

  describe "active_users_over_time" do
    it "counts distinct users who had job activity within the window" do
      other_real_user = create(:user)
      create(:job, user: admin, created_at: 1.day.ago)
      create(:job, user: admin, created_at: 1.day.ago)        # same user, same day
      create(:job, user: other_real_user, created_at: 1.day.ago)

      get_stats
      total = json_response["active_users_over_time"].sum { |p| p["count"] }
      expect(total).to eq(2)
    end

    it "excludes demo user from active user counts" do
      create(:job, user: demo_user, created_at: 1.day.ago)

      get_stats
      total = json_response["active_users_over_time"].sum { |p| p["count"] }
      expect(total).to eq(0)
    end
  end
end
