# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Analytics API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # Helper: create a job and walk it through statuses via update! so callbacks fire.
  # Always starts at wishlist, then walks through each status in order.
  # The new auto_create_timeline_entry handles wishlist → beyond-applied jumps
  # by synthesizing an applied entry automatically.
  def create_job_through_statuses(user:, statuses:, **attrs)
    job = create(:job, :wishlist, user: user, **attrs)
    statuses.each { |s| job.update!(status: s) }
    job
  end

  describe "GET /api/v1/analytics" do
    # ── Authentication guard ──────────────────────────────────────────────────

    context "when no token is provided" do
      it "returns 401" do
        get "/api/v1/analytics", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when an expired token is provided" do
      before { set_auth_cookie(expired_jwt_for(user)) }

      it "returns 401" do
        get "/api/v1/analytics", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
        expect(json_response.dig("status", "message")).to match(/expired/i)
      end
    end

    # ── Response structure ────────────────────────────────────────────────────

    context "with a valid token" do
      it "returns 200 OK" do
        get "/api/v1/analytics", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "returns all expected top-level keys" do
        get "/api/v1/analytics", headers: headers
        expect(json_response.keys).to match_array(
          %w[funnel_data summary_stats activity source_performance stage_durations]
        )
      end
    end

    # ── User scoping ──────────────────────────────────────────────────────────

    context "user scoping" do
      it "only includes the current user's jobs" do
        3.times { create_job_through_statuses(user: user, statuses: [ "applied" ], source: "seek") }

        other_user = create(:user)
        5.times { create_job_through_statuses(user: other_user, statuses: [ "applied" ], source: "seek") }

        get "/api/v1/analytics", headers: headers
        expect(json_response["summary_stats"]["total_applied"]).to eq(3)
      end
    end

    # ── Summary stats ─────────────────────────────────────────────────────────

    describe "summary_stats" do
      context "with no jobs" do
        it "returns zeroes and nil for all metrics" do
          get "/api/v1/analytics", headers: headers
          summary = json_response["summary_stats"]

          expect(summary["total_applied"]).to eq(0)
          expect(summary["response_rate"]).to eq(0)
          expect(summary["interview_rate"]).to eq(0)
          expect(summary["avg_days_to_respond"]).to be_nil
        end
      end

      context "with jobs at various stages" do
        before do
          create_list(:job, 2, :wishlist, user: user)
          3.times { create_job_through_statuses(user: user, statuses: [ "applied" ]) }
          2.times { create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing]) }
          create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing offer])
        end

        it "counts total_applied excluding wishlist jobs" do
          get "/api/v1/analytics", headers: headers
          # 3 applied + 2 interviewing + 1 offer = 6
          expect(json_response["summary_stats"]["total_applied"]).to eq(6)
        end

        it "calculates response_rate from timeline history" do
          get "/api/v1/analytics", headers: headers
          # 2 reached phone_screen/interviewing + 1 reached offer = 3 responded, total = 6 → 50%
          expect(json_response["summary_stats"]["response_rate"]).to eq(50.0)
        end

        it "calculates interview_rate from timeline history" do
          get "/api/v1/analytics", headers: headers
          # 2 reached interviewing + 1 reached offer = 3, total = 6 → 50%
          expect(json_response["summary_stats"]["interview_rate"]).to eq(50.0)
        end
      end

      context "when all applied jobs got responses" do
        before do
          4.times { create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing]) }
        end

        it "returns 100% response rate" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["summary_stats"]["response_rate"]).to eq(100.0)
        end
      end

      context "when no applied jobs got responses" do
        before do
          3.times { create_job_through_statuses(user: user, statuses: [ "applied" ]) }
        end

        it "returns 0% response rate" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["summary_stats"]["response_rate"]).to eq(0.0)
        end
      end

      context "when a job goes applied → rejected (no interview)" do
        before do
          2.times { create_job_through_statuses(user: user, statuses: [ "applied" ]) }
          create_job_through_statuses(user: user, statuses: %w[applied rejected])
        end

        it "counts rejected as a response in response_rate" do
          get "/api/v1/analytics", headers: headers
          # 1 rejected out of 3 total = 33.3%
          expect(json_response["summary_stats"]["response_rate"]).to eq(33.3)
        end

        it "does not count rejected in interview_rate" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["summary_stats"]["interview_rate"]).to eq(0.0)
        end
      end

      context "when a job goes applied → interviewing → rejected" do
        before do
          create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing rejected])
        end

        it "still counts in response_rate even though current status is rejected" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["summary_stats"]["response_rate"]).to eq(100.0)
        end

        it "still counts in interview_rate even though current status is rejected" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["summary_stats"]["interview_rate"]).to eq(100.0)
        end

        it "shows rejected as the current status in the funnel" do
          get "/api/v1/analytics", headers: headers
          funnel = json_response["funnel_data"]
          rejected = funnel.find { |f| f["status"] == "rejected" }
          expect(rejected["count"]).to eq(1)
        end
      end

      context "when a job is moved back to wishlist after reaching interviewing" do
        before do
          # This job reached interviewing then was moved back to wishlist
          job = create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing])
          job.update!(status: "wishlist")

          # Another normal applied job
          create_job_through_statuses(user: user, statuses: [ "applied" ])
        end

        it "still counts the reverted job in total_applied (timeline history)" do
          get "/api/v1/analytics", headers: headers
          # Both jobs reached applied via timeline, so total = 2
          expect(json_response["summary_stats"]["total_applied"]).to eq(2)
        end

        it "still counts the reverted job in interview_rate" do
          get "/api/v1/analytics", headers: headers
          # 1 out of 2 reached interviewing = 50%
          expect(json_response["summary_stats"]["interview_rate"]).to eq(50.0)
        end

        it "does not produce rates above 100%" do
          get "/api/v1/analytics", headers: headers
          summary = json_response["summary_stats"]
          expect(summary["response_rate"]).to be <= 100.0
          expect(summary["interview_rate"]).to be <= 100.0
        end
      end
    end

    # ── Funnel data ───────────────────────────────────────────────────────────

    describe "funnel_data" do
      context "with jobs at various stages" do
        before do
          create_list(:job, 3, :wishlist, user: user)
          2.times { create_job_through_statuses(user: user, statuses: [ "applied" ]) }
          create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing])
          create_job_through_statuses(user: user, statuses: %w[applied rejected])
        end

        it "returns all 9 status types in the correct order" do
          get "/api/v1/analytics", headers: headers
          statuses = json_response["funnel_data"].map { |f| f["status"] }

          expect(statuses).to eq(
            %w[wishlist applied phone_screen interviewing offer accepted rejected ghosted withdrawn]
          )
        end

        it "returns correct counts for populated statuses" do
          get "/api/v1/analytics", headers: headers
          funnel = json_response["funnel_data"]

          expect(funnel.find { |f| f["status"] == "wishlist" }["count"]).to eq(3)
          expect(funnel.find { |f| f["status"] == "applied" }["count"]).to eq(2)
          expect(funnel.find { |f| f["status"] == "interviewing" }["count"]).to eq(1)
          expect(funnel.find { |f| f["status"] == "rejected" }["count"]).to eq(1)
        end

        it "returns 0 for statuses with no jobs" do
          get "/api/v1/analytics", headers: headers
          funnel = json_response["funnel_data"]

          expect(funnel.find { |f| f["status"] == "offer" }["count"]).to eq(0)
          expect(funnel.find { |f| f["status"] == "ghosted" }["count"]).to eq(0)
        end
      end

      context "with no jobs" do
        it "returns all statuses with 0 counts" do
          get "/api/v1/analytics", headers: headers
          funnel = json_response["funnel_data"]

          expect(funnel.length).to eq(9)
          expect(funnel.all? { |f| f["count"] == 0 }).to be true
        end
      end
    end

    # ── Activity data ─────────────────────────────────────────────────────────

    describe "activity" do
      it "returns both weekly and monthly keys" do
        get "/api/v1/analytics", headers: headers
        expect(json_response["activity"].keys).to match_array(%w[weekly monthly])
      end

      context "with jobs created across multiple weeks" do
        before do
          create(:job, :wishlist, user: user, created_at: 3.weeks.ago)
          create(:job, :wishlist, user: user, created_at: 3.weeks.ago + 1.day)
          create(:job, :wishlist, user: user, created_at: 1.week.ago)
        end

        it "groups weekly data into distinct periods" do
          get "/api/v1/analytics", headers: headers
          weekly = json_response["activity"]["weekly"]

          expect(weekly.length).to be >= 2
        end

        it "totals match the actual job count" do
          get "/api/v1/analytics", headers: headers
          weekly = json_response["activity"]["weekly"]

          total = weekly.sum { |w| w["count"] }
          expect(total).to eq(3)
        end

        it "sorts periods in ascending order" do
          get "/api/v1/analytics", headers: headers
          weekly = json_response["activity"]["weekly"]
          periods = weekly.map { |w| w["period"] }

          expect(periods).to eq(periods.sort)
        end
      end

      context "with jobs created across multiple months" do
        before do
          create(:job, :wishlist, user: user, created_at: 2.months.ago)
          create(:job, :wishlist, user: user, created_at: 1.month.ago)
          create(:job, :wishlist, user: user, created_at: Time.current)
        end

        it "groups monthly data correctly" do
          get "/api/v1/analytics", headers: headers
          monthly = json_response["activity"]["monthly"]

          expect(monthly.length).to be >= 2
          total = monthly.sum { |m| m["count"] }
          expect(total).to eq(3)
        end
      end

      context "with no jobs" do
        it "returns empty arrays" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["activity"]["weekly"]).to be_empty
          expect(json_response["activity"]["monthly"]).to be_empty
        end
      end
    end

    # ── Source performance ────────────────────────────────────────────────────

    describe "source_performance" do
      context "with jobs from different sources" do
        before do
          # Seek: 2 applied only + 1 that reached interviewing
          2.times { create_job_through_statuses(user: user, statuses: [ "applied" ], source: "seek") }
          create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing], source: "seek")

          # LinkedIn: 2 applied only
          2.times { create_job_through_statuses(user: user, statuses: [ "applied" ], source: "linkedin") }

          # Referral: 1 that reached interviewing (uses INTERVIEW_STATUSES, not phone_screen)
          create_job_through_statuses(user: user, statuses: %w[applied phone_screen interviewing], source: "referral")

          # Wishlist jobs should NOT count as applied
          create(:job, :wishlist, user: user, source: "seek")
        end

        it "returns all 5 source types" do
          get "/api/v1/analytics", headers: headers
          sources = json_response["source_performance"].map { |s| s["source"] }

          expect(sources).to eq(%w[seek linkedin referral company_site other])
        end

        it "counts applied correctly per source excluding wishlist" do
          get "/api/v1/analytics", headers: headers
          perf = json_response["source_performance"]

          expect(perf.find { |s| s["source"] == "seek" }["applied"]).to eq(3)
          expect(perf.find { |s| s["source"] == "linkedin" }["applied"]).to eq(2)
          expect(perf.find { |s| s["source"] == "referral" }["applied"]).to eq(1)
        end

        it "counts got_interview using INTERVIEW_STATUSES (interviewing/offer/accepted)" do
          get "/api/v1/analytics", headers: headers
          perf = json_response["source_performance"]

          # Seek: 1 reached interviewing
          expect(perf.find { |s| s["source"] == "seek" }["got_interview"]).to eq(1)
          # LinkedIn: none reached interviewing
          expect(perf.find { |s| s["source"] == "linkedin" }["got_interview"]).to eq(0)
          # Referral: 1 reached interviewing
          expect(perf.find { |s| s["source"] == "referral" }["got_interview"]).to eq(1)
        end

        it "returns 0 for sources with no jobs" do
          get "/api/v1/analytics", headers: headers
          perf = json_response["source_performance"]

          company_site = perf.find { |s| s["source"] == "company_site" }
          expect(company_site["applied"]).to eq(0)
          expect(company_site["got_interview"]).to eq(0)
        end
      end

      context "when a source job reached interviewing then was rejected" do
        before do
          create_job_through_statuses(
            user: user,
            statuses: %w[applied phone_screen interviewing rejected],
            source: "linkedin"
          )
        end

        it "still counts the source as producing an interview" do
          get "/api/v1/analytics", headers: headers
          perf = json_response["source_performance"]
          linkedin = perf.find { |s| s["source"] == "linkedin" }

          expect(linkedin["applied"]).to eq(1)
          expect(linkedin["got_interview"]).to eq(1)
        end
      end

      context "when a source job only reached phone_screen" do
        before do
          create_job_through_statuses(
            user: user,
            statuses: %w[applied phone_screen],
            source: "referral"
          )
        end

        it "does not count phone_screen as got_interview" do
          get "/api/v1/analytics", headers: headers
          perf = json_response["source_performance"]
          referral = perf.find { |s| s["source"] == "referral" }

          expect(referral["applied"]).to eq(1)
          expect(referral["got_interview"]).to eq(0)
        end
      end
    end

    # ── Stage durations ───────────────────────────────────────────────────────

    describe "stage_durations" do
      it "returns all 4 transition labels" do
        get "/api/v1/analytics", headers: headers
        labels = json_response["stage_durations"].map { |s| s["label"] }

        expect(labels).to eq([
          "Applied → Phone screen",
          "Phone screen → Interview",
          "Interview → Offer",
          "Offer → Accepted"
        ])
      end

      context "with no status transitions" do
        it "returns nil for all avg_days" do
          get "/api/v1/analytics", headers: headers
          durations = json_response["stage_durations"]

          expect(durations.all? { |d| d["avg_days"].nil? }).to be true
        end
      end

      context "with a job that progressed through stages" do
        let(:job) { create(:job, :wishlist, user: user) }

        before do
          base_time = 10.days.ago

          create(:timeline_entry, :status_change, job: job,
            description: "Status changed from wishlist to applied",
            occurred_at: base_time,
            metadata: { from: "wishlist", to: "applied" })

          create(:timeline_entry, :status_change, job: job,
            description: "Status changed from applied to phone_screen",
            occurred_at: base_time + 3.days,
            metadata: { from: "applied", to: "phone_screen" })

          create(:timeline_entry, :status_change, job: job,
            description: "Status changed from phone_screen to interviewing",
            occurred_at: base_time + 6.days,
            metadata: { from: "phone_screen", to: "interviewing" })

          job.update_column(:status, "interviewing")
        end

        it "calculates average days for applied to phone_screen" do
          get "/api/v1/analytics", headers: headers
          durations = json_response["stage_durations"]
          applied_to_phone = durations.find { |d| d["label"] == "Applied → Phone screen" }

          expect(applied_to_phone["avg_days"]).to be_present
          expect(applied_to_phone["avg_days"].to_f).to be_within(0.5).of(3.0)
        end

        it "calculates average days for phone_screen to interview" do
          get "/api/v1/analytics", headers: headers
          durations = json_response["stage_durations"]
          phone_to_interview = durations.find { |d| d["label"] == "Phone screen → Interview" }

          expect(phone_to_interview["avg_days"]).to be_present
          expect(phone_to_interview["avg_days"].to_f).to be_within(0.5).of(3.0)
        end

        it "returns nil for transitions that have not happened" do
          get "/api/v1/analytics", headers: headers
          durations = json_response["stage_durations"]

          interview_to_offer = durations.find { |d| d["label"] == "Interview → Offer" }
          offer_to_accepted = durations.find { |d| d["label"] == "Offer → Accepted" }

          expect(interview_to_offer["avg_days"]).to be_nil
          expect(offer_to_accepted["avg_days"]).to be_nil
        end
      end

      context "with multiple jobs averaging different durations" do
        before do
          job1 = create(:job, :wishlist, user: user)
          base1 = 15.days.ago
          create(:timeline_entry, :status_change, job: job1,
            description: "Status changed from wishlist to applied",
            occurred_at: base1,
            metadata: { from: "wishlist", to: "applied" })
          create(:timeline_entry, :status_change, job: job1,
            description: "Status changed from applied to phone_screen",
            occurred_at: base1 + 2.days,
            metadata: { from: "applied", to: "phone_screen" })

          job2 = create(:job, :wishlist, user: user)
          base2 = 20.days.ago
          create(:timeline_entry, :status_change, job: job2,
            description: "Status changed from wishlist to applied",
            occurred_at: base2,
            metadata: { from: "wishlist", to: "applied" })
          create(:timeline_entry, :status_change, job: job2,
            description: "Status changed from applied to phone_screen",
            occurred_at: base2 + 6.days,
            metadata: { from: "applied", to: "phone_screen" })
        end

        it "averages the durations across multiple jobs" do
          get "/api/v1/analytics", headers: headers
          durations = json_response["stage_durations"]
          applied_to_phone = durations.find { |d| d["label"] == "Applied → Phone screen" }

          # Average of 2 days and 6 days = 4 days
          expect(applied_to_phone["avg_days"].to_f).to be_within(0.5).of(4.0)
        end
      end

      context "with non-status_change timeline entries" do
        before do
          job = create(:job, :wishlist, user: user)
          job.update!(status: "applied")

          create(:timeline_entry, :note, job: job,
            description: "Spoke to recruiter about phone_screen process",
            occurred_at: 5.days.ago)

          # An interview entry with matching metadata — should NOT count
          # because entry_type is "interview", not "status_change"
          create(:timeline_entry, :interview, job: job,
            description: "Status changed from applied to phone_screen",
            occurred_at: 3.days.ago,
            metadata: { from: "applied", to: "phone_screen" })
        end

        it "only uses status_change entry_type for stage durations" do
          get "/api/v1/analytics", headers: headers
          durations = json_response["stage_durations"]
          applied_to_phone = durations.find { |d| d["label"] == "Applied → Phone screen" }

          expect(applied_to_phone["avg_days"]).to be_nil
        end
      end
    end

    # ── Edge cases ────────────────────────────────────────────────────────────

    describe "edge cases" do
      context "with only wishlist jobs" do
        before { create_list(:job, 3, :wishlist, user: user) }

        it "returns 0 for total_applied without division error" do
          get "/api/v1/analytics", headers: headers
          summary = json_response["summary_stats"]

          expect(summary["total_applied"]).to eq(0)
          expect(summary["response_rate"]).to eq(0)
          expect(summary["interview_rate"]).to eq(0)
        end

        it "still shows wishlist count in funnel" do
          get "/api/v1/analytics", headers: headers
          wishlist = json_response["funnel_data"].find { |f| f["status"] == "wishlist" }
          expect(wishlist["count"]).to eq(3)
        end
      end

      context "with archived jobs" do
        before do
          create_job_through_statuses(user: user, statuses: [ "applied" ])
          archived = create_job_through_statuses(user: user, statuses: [ "applied" ])
          archived.archive!
        end

        it "includes archived jobs in analytics counts" do
          get "/api/v1/analytics", headers: headers
          expect(json_response["summary_stats"]["total_applied"]).to eq(2)
        end
      end

      context "with a single job" do
        before { create_job_through_statuses(user: user, statuses: [ "applied" ], source: "linkedin") }

        it "returns valid analytics" do
          get "/api/v1/analytics", headers: headers

          expect(json_response["summary_stats"]["total_applied"]).to eq(1)
          expect(json_response["summary_stats"]["response_rate"]).to eq(0.0)
          expect(json_response["activity"]["weekly"].length).to eq(1)
          expect(json_response["activity"]["monthly"].length).to eq(1)
        end
      end
    end

    # ── Timeline entry business logic ─────────────────────────────────────────

    describe "timeline entry creation" do
      it "stores from and to statuses in metadata on status change" do
        job = create(:job, :wishlist, user: user)
        job.update!(status: "applied")

        entry = job.timeline_entries.status_change.last
        expect(entry.metadata["from"]).to eq("wishlist")
        expect(entry.metadata["to"]).to eq("applied")
      end

      it "synthesizes an applied entry when jumping from wishlist past applied" do
        job = create(:job, :wishlist, user: user)
        job.update!(status: "interviewing")

        entries = job.timeline_entries.status_change.reorder(occurred_at: :asc, id: :asc)
        expect(entries.length).to eq(2)

        # First entry: synthetic applied
        expect(entries.first.metadata["from"]).to eq("wishlist")
        expect(entries.first.metadata["to"]).to eq("applied")

        # Second entry: actual transition
        expect(entries.second.metadata["from"]).to eq("applied")
        expect(entries.second.metadata["to"]).to eq("interviewing")
      end

      it "creates a single entry for normal wishlist → applied transition" do
        job = create(:job, :wishlist, user: user)
        job.update!(status: "applied")

        entries = job.timeline_entries.status_change
        expect(entries.length).to eq(1)
        expect(entries.first.metadata["to"]).to eq("applied")
      end

      it "creates initial timeline entries when a job is created beyond wishlist" do
        job = create(:job, user: user, status: "interviewing")

        entries = job.timeline_entries.status_change.reorder(occurred_at: :asc, id: :asc)

        expect(entries.length).to eq(2)

        # First: synthetic applied entry
        expect(entries.first.metadata["to"]).to eq("applied")

        # Second: the created status
        expect(entries.second.metadata["to"]).to eq("interviewing")
      end

      it "creates a single entry when a job is created as applied" do
        job = create(:job, user: user, status: "applied")

        entries = job.timeline_entries.status_change
        expect(entries.length).to eq(1)
        expect(entries.first.metadata["to"]).to eq("applied")
      end

      it "does not create timeline entries for wishlist jobs" do
        job = create(:job, :wishlist, user: user)

        expect(job.timeline_entries.status_change).to be_empty
      end

      it "uses date_applied for the applied entry timestamp when present" do
        applied_date = 10.days.ago.to_date
        job = create(:job, user: user, status: "applied", date_applied: applied_date)

        entry = job.timeline_entries.status_change.first
        expect(entry.occurred_at.to_date).to eq(applied_date)
      end
    end
  end
end
