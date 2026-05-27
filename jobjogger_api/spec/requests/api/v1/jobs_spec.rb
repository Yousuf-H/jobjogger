# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Jobs API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # ── GET /api/v1/jobs (index) ──────────────────────────────────────────────────

  describe "GET /api/v1/jobs" do
    before do
      create_list(:job, 2, :wishlist, user: user)
      create_list(:job, 2, :rejected, user: user)   # terminal – excluded from active
      create(:job, :archived, user: user)             # archived – excluded from active
    end

    # ── Authentication guard ────────────────────────────────────────────────────

    context "when no token is provided" do
      it "returns 401" do
        get "/api/v1/jobs", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when an expired token is provided" do
      before { set_auth_cookie(expired_jwt_for(user)) }

      it "returns 401" do
        get "/api/v1/jobs", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
        expect(json_response.dig("status", "message")).to match(/expired/i)
      end
    end

    # ── Normal behaviour ────────────────────────────────────────────────────────

    context "with a valid token" do
      it "returns 200 OK" do
        get "/api/v1/jobs", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "returns only the authenticated user's active jobs" do
        other_user = create(:user)
        create(:job, :wishlist, user: other_user)

        get "/api/v1/jobs", headers: headers
        returned_ids = json_response.map { |j| j["id"] }
        user_job_ids = user.jobs.active.pluck(:id)

        expect(returned_ids).to match_array(user_job_ids)
      end

      it "returns JSON with expected job attributes" do
        get "/api/v1/jobs", headers: headers
        job = json_response.first
        expect(job).to include("id", "company_name", "job_title", "status")
      end
    end

    # ── Filters ─────────────────────────────────────────────────────────────────

    describe "filtering" do
      context "archived=true" do
        it "returns only archived jobs" do
          get "/api/v1/jobs", params: { archived: "true" }, headers: headers
          expect(response).to have_http_status(:ok)
          expect(json_response.size).to eq(1)
        end
      end

      context "status filter" do
        it "returns only jobs with the specified status" do
          get "/api/v1/jobs", params: { status: "wishlist" }, headers: headers
          returned_statuses = json_response.map { |j| j["status"] }.uniq
          expect(returned_statuses).to eq(["wishlist"])
        end
      end

      context "status filter for terminal statuses" do
        it "returns terminal-status jobs even when archived is not set" do
          get "/api/v1/jobs", params: { status: "rejected" }, headers: headers
          expect(response).to have_http_status(:ok)
          expect(json_response).not_to be_empty
          expect(json_response.map { |j| j["status"] }.uniq).to eq(["rejected"])
        end
      end

      context "multiple status filter" do
        it "returns jobs matching any of the specified statuses" do
          get "/api/v1/jobs", params: { status: ["wishlist", "rejected"] }, headers: headers
          expect(response).to have_http_status(:ok)
          returned_statuses = json_response.map { |j| j["status"] }.uniq
          expect(returned_statuses).to all(be_in(["wishlist", "rejected"]))
        end
      end

      context "overdue=true" do
        it "returns only overdue active jobs" do
          create(:job, :wishlist, :overdue, user: user)
          get "/api/v1/jobs", params: { overdue: "true" }, headers: headers
          expect(response).to have_http_status(:ok)
          json_response.each do |job|
            expect(Date.parse(job["follow_up_date"])).to be < Date.current
          end
        end
      end

      context "due_this_week=true" do
        it "returns only jobs due this week" do
          create(:job, :wishlist, :due_this_week, user: user)
          get "/api/v1/jobs", params: { due_this_week: "true" }, headers: headers

          expect(response).to have_http_status(:ok)
          json_response.each do |job|
            due = Date.parse(job["follow_up_date"])
            expect(due).to be_between(Date.current, Date.current.end_of_week(:sunday))
          end
          expect(json_response).not_to be_empty
        end
      end

      context "tags_any filter" do
        it "returns jobs that have at least one matching tag" do
          tagged_job = create(:job, :wishlist, user: user, tags: ["ruby", "rails"])
          create(:job, :wishlist, user: user, tags: ["python"])

          get "/api/v1/jobs", params: { tags_any: ["ruby"] }, headers: headers
          returned_ids = json_response.map { |j| j["id"] }
          expect(returned_ids).to include(tagged_job.id)
        end
      end

      context "search filter" do
        it "returns jobs matching company_name" do
          matched = create(:job, :wishlist, user: user, company_name: "Acme Corp")
          create(:job, :wishlist, user: user, company_name: "Other LLC")

          get "/api/v1/jobs", params: { search: "Acme" }, headers: headers
          returned_ids = json_response.map { |j| j["id"] }
          expect(returned_ids).to include(matched.id)
        end

        it "is case-insensitive" do
          matched = create(:job, :wishlist, user: user, company_name: "Acme Corp")
          get "/api/v1/jobs", params: { search: "acme corp" }, headers: headers
          returned_ids = json_response.map { |j| j["id"] }
          expect(returned_ids).to include(matched.id)
        end
      end

      context "source filter" do
        it "returns only jobs from the specified source" do
          seek_job    = create(:job, :wishlist, :from_seek, user: user)
          linkedin_job = create(:job, :wishlist, user: user, source: "linkedin")

          get "/api/v1/jobs", params: { source: "seek" }, headers: headers
          returned_ids = json_response.map { |j| j["id"] }
          expect(returned_ids).to include(seek_job.id)
          expect(returned_ids).not_to include(linkedin_job.id)
        end
      end

      context "priority filter" do
        it "returns only jobs with the specified priority" do
          high_job = create(:job, :wishlist, user: user, priority: "high")
          low_job  = create(:job, :wishlist, user: user, priority: "low")

          get "/api/v1/jobs", params: { priority: "high" }, headers: headers
          returned_ids = json_response.map { |j| j["id"] }
          expect(returned_ids).to include(high_job.id)
          expect(returned_ids).not_to include(low_job.id)
        end
      end
    end

    # ── Sorting ──────────────────────────────────────────────────────────────────

    describe "sorting" do
      it "accepts sort=created_at with direction=desc" do
        get "/api/v1/jobs", params: { sort: "created_at", direction: "desc" }, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "ignores unknown sort columns (uses default)" do
        get "/api/v1/jobs", params: { sort: "evil_column; DROP TABLE jobs--" }, headers: headers
        expect(response).to have_http_status(:ok)
      end
    end
  end

  # ── GET /api/v1/jobs/:id (show) ───────────────────────────────────────────────

  describe "GET /api/v1/jobs/:id" do
    let(:job) { create(:job, :with_timeline_entries, user: user) }

    context "when the job belongs to the current user" do
      it "returns 200 OK" do
        get "/api/v1/jobs/#{job.id}", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "includes the job and its timeline entries" do
        get "/api/v1/jobs/#{job.id}", headers: headers
        body = json_response
        expect(body["job"]["id"]).to eq(job.id)
        expect(body["timeline_entries"]).to be_an(Array)
        expect(body["timeline_entries"].size).to eq(job.timeline_entries.count)
      end
    end

    context "when the job belongs to another user" do
      let(:other_job) { create(:job, user: create(:user)) }

      it "returns 404 Not Found" do
        get "/api/v1/jobs/#{other_job.id}", headers: headers
        expect(response).to have_http_status(:not_found)
        expect(json_response["error"]).to match(/not found/i)
      end
    end

    context "when the job does not exist" do
      it "returns 404 Not Found" do
        get "/api/v1/jobs/999999", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "without authentication" do
      it "returns 401" do
        get "/api/v1/jobs/#{job.id}", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── POST /api/v1/jobs (create) ────────────────────────────────────────────────

  describe "POST /api/v1/jobs" do
    let(:valid_params) do
      {
        job: {
          company_name: Faker::Company.name,
          job_title:    Faker::Job.title,
          status:       "wishlist",
          location:     Faker::Address.city,
          employment_type: "full_time",
          source:       "linkedin"
        }
      }
    end

    context "with valid parameters" do
      it "creates a job for the current user" do
        expect {
          post "/api/v1/jobs", params: valid_params.to_json, headers: headers
        }.to change(user.jobs, :count).by(1)
      end

      it "returns 201 Created" do
        post "/api/v1/jobs", params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:created)
      end

      it "returns the created job in the response" do
        post "/api/v1/jobs", params: valid_params.to_json, headers: headers
        body = json_response
        expect(body["company_name"]).to eq(valid_params[:job][:company_name])
        expect(body["status"]).to eq("wishlist")
      end

      it "associates the job with the authenticated user" do
        post "/api/v1/jobs", params: valid_params.to_json, headers: headers
        created_id = json_response["id"]
        expect(Job.find(created_id).user_id).to eq(user.id)
      end

      it "normalises tags on creation" do
        params = valid_params.deep_merge(job: { tags: ["Ruby on Rails", " REACT "] })
        post "/api/v1/jobs", params: params.to_json, headers: headers
        job = Job.find(json_response["id"])
        expect(job.tags).to eq(["ruby-on-rails", "react"])
      end
    end

    context "with invalid parameters" do
      it "returns 422 when company_name is missing" do
        post "/api/v1/jobs",
             params: { job: valid_params[:job].merge(company_name: "") }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to be_present
      end

      it "returns 422 when status is invalid" do
        post "/api/v1/jobs",
             params: { job: valid_params[:job].merge(status: "not_a_status") }.to_json,
             headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end

      it "returns 422 when source is 'other' without source_other" do
        post "/api/v1/jobs",
             params: { job: valid_params[:job].merge(source: "other", source_other: nil) }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "does not create a job on failure" do
        expect {
          post "/api/v1/jobs",
               params: { job: valid_params[:job].merge(company_name: "") }.to_json,
               headers: headers
        }.not_to change(Job, :count)
      end
    end

    context "when a demo user has reached the organisation limit" do
      let(:demo_user)    { create(:user, :demo) }
      let(:demo_headers) { auth_headers_for(demo_user) }

      before do
        create_list(:organisation, 20, user: demo_user)
      end

      it "returns 422 and does not create a job or organisation" do
        expect {
          post "/api/v1/jobs",
               params: valid_params.deep_merge(job: { company_name: "Over The Limit Corp" }).to_json,
               headers: demo_headers
        }.to change(Job, :count).by(0).and change(Organisation, :count).by(0)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to include(match(/demo account/i))
      end
    end

    context "without authentication" do
      it "returns 401" do
        post "/api/v1/jobs", params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── PATCH /api/v1/jobs/:id (update) ──────────────────────────────────────────

  describe "PATCH /api/v1/jobs/:id" do
    let(:job) { create(:job, :wishlist, user: user) }

    context "with valid parameters" do
      it "returns 200 OK" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { company_name: "New Company" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "updates the job attributes" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { company_name: "New Company" } }.to_json,
              headers: headers
        expect(job.reload.company_name).to eq("New Company")
      end

      it "auto-sets date_applied when status changes to applied" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { status: "applied" } }.to_json,
              headers: headers
        expect(job.reload.date_applied).to eq(Date.current)
      end

      it "creates a status_change timeline entry when status changes" do
        expect {
          patch "/api/v1/jobs/#{job.id}",
                params: { job: { status: "applied" } }.to_json,
                headers: headers
        }.to change { job.timeline_entries.status_change.count }.by(1)
      end
    end

    context "when company_name changes" do
      it "auto-links the job to a matching or new organisation" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { company_name: "Brand New Corp" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:ok)
        org = user.organisations.find_by("LOWER(name) = LOWER(?)", "Brand New Corp")
        expect(org).not_to be_nil
        expect(job.reload.organisation_id).to eq(org.id)
      end

      it "does not persist a new organisation if the job update fails" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { company_name: "Rollback Corp", status: "not_a_status" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(user.organisations.find_by("LOWER(name) = LOWER(?)", "Rollback Corp")).to be_nil
      end
    end

    context "when organisation_id belongs to another user" do
      let(:other_org) { create(:organisation, user: create(:user)) }

      it "returns 404 and does not update the job" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { organisation_id: other_org.id } }.to_json,
              headers: headers
        expect(response).to have_http_status(:not_found)
        expect(job.reload.organisation_id).not_to eq(other_org.id)
      end
    end

    context "with invalid parameters" do
      it "returns 422 Unprocessable Entity" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { company_name: "" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when the job belongs to another user" do
      let(:other_job) { create(:job, user: create(:user)) }

      it "returns 404 Not Found" do
        patch "/api/v1/jobs/#{other_job.id}",
              params: { job: { company_name: "Hack" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "without authentication" do
      it "returns 401" do
        patch "/api/v1/jobs/#{job.id}",
              params: { job: { company_name: "New" } }.to_json,
              headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── DELETE /api/v1/jobs/:id (destroy) ─────────────────────────────────────────

  describe "DELETE /api/v1/jobs/:id" do
    let!(:job) { create(:job, user: user) }

    context "when the job belongs to the current user" do
      it "returns 204 No Content" do
        delete "/api/v1/jobs/#{job.id}", headers: headers
        expect(response).to have_http_status(:no_content)
      end

      it "deletes the job" do
        expect {
          delete "/api/v1/jobs/#{job.id}", headers: headers
        }.to change(Job, :count).by(-1)
      end
    end

    context "when the job belongs to another user" do
      let!(:other_job) { create(:job, user: create(:user)) }

      it "returns 404 Not Found" do
        delete "/api/v1/jobs/#{other_job.id}", headers: headers
        expect(response).to have_http_status(:not_found)
      end

      it "does not delete the job" do
        expect {
          delete "/api/v1/jobs/#{other_job.id}", headers: headers
        }.not_to change(Job, :count)
      end
    end

    context "without authentication" do
      it "returns 401" do
        delete "/api/v1/jobs/#{job.id}", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── PATCH /api/v1/jobs/:id/archive ────────────────────────────────────────────

  describe "PATCH /api/v1/jobs/:id/archive" do
    let(:job) { create(:job, :wishlist, user: user) }

    it "returns 200 OK" do
      patch "/api/v1/jobs/#{job.id}/archive", headers: headers
      expect(response).to have_http_status(:ok)
    end

    it "sets archived_at on the job" do
      patch "/api/v1/jobs/#{job.id}/archive", headers: headers
      expect(job.reload.archived_at).not_to be_nil
    end

    it "returns 404 when the job belongs to another user" do
      other_job = create(:job, user: create(:user))
      patch "/api/v1/jobs/#{other_job.id}/archive", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without a token" do
      patch "/api/v1/jobs/#{job.id}/archive",
            headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── PATCH /api/v1/jobs/:id/unarchive ──────────────────────────────────────────

  # ── PATCH /api/v1/jobs/:id — resume_variant_id linking ───────────────────────

  describe "PATCH /api/v1/jobs/:id (resume_variant_id)" do
    let(:job)     { create(:job, user: user) }
    let(:variant) { create(:resume_variant, resume_template: create(:resume_template, user: user), user: user) }

    def patch_job(params)
      patch "/api/v1/jobs/#{job.id}", params: { job: params }.to_json, headers: headers
    end

    it "links an existing variant and returns 200" do
      patch_job(resume_variant_id: variant.id)
      expect(response).to have_http_status(:ok)
      expect(job.reload.resume_variant_id).to eq(variant.id)
    end

    it "clears the variant when nil is sent" do
      job.update!(resume_variant_id: variant.id)
      patch_job(resume_variant_id: nil)
      expect(response).to have_http_status(:ok)
      expect(job.reload.resume_variant_id).to be_nil
    end

    it "returns 404 when the variant belongs to another user" do
      other_variant = create(:resume_variant,
                             resume_template: create(:resume_template, user: create(:user)),
                             user: create(:user))
      patch_job(resume_variant_id: other_variant.id)
      expect(response).to have_http_status(:not_found)
      expect(job.reload.resume_variant_id).to be_nil
    end

    it "does not touch resume_variant_id when the key is omitted" do
      job.update!(resume_variant_id: variant.id)
      patch_job(notes: "updated")
      expect(job.reload.resume_variant_id).to eq(variant.id)
    end
  end

  describe "PATCH /api/v1/jobs/:id/unarchive" do
    let(:job) { create(:job, :archived, user: user) }

    it "returns 200 OK" do
      patch "/api/v1/jobs/#{job.id}/unarchive", headers: headers
      expect(response).to have_http_status(:ok)
    end

    it "clears archived_at on the job" do
      patch "/api/v1/jobs/#{job.id}/unarchive", headers: headers
      expect(job.reload.archived_at).to be_nil
    end

    it "returns 404 when the job belongs to another user" do
      other_job = create(:job, :archived, user: create(:user))
      patch "/api/v1/jobs/#{other_job.id}/unarchive", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
