# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Organisations API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # ── GET /api/v1/organisations (index) ────────────────────────────────────────

  describe "GET /api/v1/organisations" do
    let!(:org1) { create(:organisation, user: user, name: "Acme") }
    let!(:org2) { create(:organisation, user: user, name: "Zeta") }

    context "without authentication" do
      it "returns 401" do
        get "/api/v1/organisations", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with a valid token" do
      it "returns 200 OK" do
        get "/api/v1/organisations", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "returns only the authenticated user's organisations" do
        create(:organisation, user: create(:user))

        get "/api/v1/organisations", headers: headers
        returned_ids = json_response.map { |o| o["id"] }
        expect(returned_ids).to match_array([org1.id, org2.id])
      end

      it "returns organisations sorted alphabetically by name" do
        get "/api/v1/organisations", headers: headers
        names = json_response.map { |o| o["name"] }
        expect(names).to eq(names.sort)
      end

      it "includes active_jobs_count and total_jobs_count" do
        create(:job, :wishlist, user: user, company_name: org1.name, organisation: org1)
        create(:job, :rejected, user: user, company_name: org1.name, organisation: org1)

        get "/api/v1/organisations", headers: headers
        org_data = json_response.find { |o| o["id"] == org1.id }

        expect(org_data["total_jobs_count"]).to eq(2)
        expect(org_data["active_jobs_count"]).to eq(1)
      end
    end
  end

  # ── GET /api/v1/organisations/:id (show) ─────────────────────────────────────

  describe "GET /api/v1/organisations/:id" do
    let!(:org) { create(:organisation, user: user) }

    context "without authentication" do
      it "returns 401" do
        get "/api/v1/organisations/#{org.id}", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when the organisation belongs to the current user" do
      it "returns 200 OK" do
        get "/api/v1/organisations/#{org.id}", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "includes expected attributes" do
        get "/api/v1/organisations/#{org.id}", headers: headers
        expect(json_response).to include("id", "name", "needs_review", "aliases")
      end

      it "embeds linked jobs" do
        create(:job, :wishlist, user: user, company_name: org.name, organisation: org)
        create(:job, :rejected, user: user, company_name: org.name, organisation: org)

        get "/api/v1/organisations/#{org.id}", headers: headers
        jobs = json_response["jobs"]
        expect(jobs).to be_an(Array)
        expect(jobs.size).to eq(2)
        expect(jobs.first).to include("id", "job_title", "status", "archived_at")
      end
    end

    context "when the organisation belongs to another user" do
      let(:other_org) { create(:organisation, user: create(:user)) }

      it "returns 404 Not Found" do
        get "/api/v1/organisations/#{other_org.id}", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when the organisation does not exist" do
      it "returns 404 Not Found" do
        get "/api/v1/organisations/999999", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ── POST /api/v1/organisations (create) ──────────────────────────────────────

  describe "POST /api/v1/organisations" do
    let(:valid_params) { { organisation: { name: "New Company" } } }

    context "without authentication" do
      it "returns 401" do
        post "/api/v1/organisations",
             params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with valid parameters" do
      it "returns 201 Created" do
        post "/api/v1/organisations", params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:created)
      end

      it "creates the organisation for the current user" do
        expect {
          post "/api/v1/organisations", params: valid_params.to_json, headers: headers
        }.to change(user.organisations, :count).by(1)
      end

      it "sets needs_review to false regardless of what the client sends" do
        params = { organisation: { name: "Manual Org", needs_review: true } }
        post "/api/v1/organisations", params: params.to_json, headers: headers
        expect(json_response["needs_review"]).to be(false)
      end
    end

    context "with invalid parameters" do
      it "returns 422 when name is missing" do
        post "/api/v1/organisations",
             params: { organisation: { name: "" } }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to be_present
      end

      it "returns 422 when name is a duplicate for this user" do
        create(:organisation, user: user, name: "Taken Name")
        post "/api/v1/organisations",
             params: { organisation: { name: "Taken Name" } }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "allows the same name for a different user" do
        create(:organisation, user: create(:user), name: "Shared Name")
        expect {
          post "/api/v1/organisations",
               params: { organisation: { name: "Shared Name" } }.to_json,
               headers: headers
        }.to change(user.organisations, :count).by(1)
      end
    end

    context "demo account limit" do
      let(:demo_user)    { create(:user, :demo) }
      let(:demo_headers) { auth_headers_for(demo_user) }

      context "when demo user has fewer than 20 organisations" do
        before { create_list(:organisation, 19, user: demo_user) }

        it "allows creation and returns 201" do
          post "/api/v1/organisations",
               params: { organisation: { name: "New Org" } }.to_json,
               headers: demo_headers
          expect(response).to have_http_status(:created)
        end
      end

      context "when demo user already has 20 organisations" do
        before { create_list(:organisation, 20, user: demo_user) }

        it "returns 403 Forbidden" do
          post "/api/v1/organisations",
               params: { organisation: { name: "One More" } }.to_json,
               headers: demo_headers
          expect(response).to have_http_status(:forbidden)
        end

        it "does not create a new organisation" do
          expect {
            post "/api/v1/organisations",
                 params: { organisation: { name: "One More" } }.to_json,
                 headers: demo_headers
          }.not_to change(Organisation, :count)
        end
      end

      context "when a regular user has 20+ organisations" do
        before { create_list(:organisation, 20, user: user) }

        it "does not apply the demo limit" do
          expect {
            post "/api/v1/organisations",
                 params: { organisation: { name: "Extra Org" } }.to_json,
                 headers: headers
          }.to change(user.organisations, :count).by(1)
        end
      end
    end
  end

  # ── PATCH /api/v1/organisations/:id (update) ─────────────────────────────────

  describe "PATCH /api/v1/organisations/:id" do
    let!(:org) { create(:organisation, user: user, name: "Old Name") }

    context "without authentication" do
      it "returns 401" do
        patch "/api/v1/organisations/#{org.id}",
              params: { organisation: { name: "New Name" } }.to_json,
              headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with valid parameters" do
      it "returns 200 OK" do
        patch "/api/v1/organisations/#{org.id}",
              params: { organisation: { name: "New Name" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "updates the organisation" do
        patch "/api/v1/organisations/#{org.id}",
              params: { organisation: { name: "New Name", industry: "Tech" } }.to_json,
              headers: headers
        org.reload
        expect(org.name).to eq("New Name")
        expect(org.industry).to eq("Tech")
      end

      it "ignores needs_review in the payload" do
        org.update!(needs_review: false)
        patch "/api/v1/organisations/#{org.id}",
              params: { organisation: { name: "New Name", needs_review: true } }.to_json,
              headers: headers
        expect(org.reload.needs_review).to be(false)
      end
    end

    context "with invalid parameters" do
      it "returns 422 when name is blank" do
        patch "/api/v1/organisations/#{org.id}",
              params: { organisation: { name: "" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to be_present
      end
    end

    context "when the organisation belongs to another user" do
      let(:other_org) { create(:organisation, user: create(:user)) }

      it "returns 404 Not Found" do
        patch "/api/v1/organisations/#{other_org.id}",
              params: { organisation: { name: "Hack" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ── DELETE /api/v1/organisations/:id (destroy) ───────────────────────────────

  describe "DELETE /api/v1/organisations/:id" do
    let!(:org) { create(:organisation, user: user) }

    context "without authentication" do
      it "returns 401" do
        delete "/api/v1/organisations/#{org.id}", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when the organisation belongs to the current user" do
      it "returns 204 No Content" do
        delete "/api/v1/organisations/#{org.id}", headers: headers
        expect(response).to have_http_status(:no_content)
      end

      it "deletes the organisation" do
        expect {
          delete "/api/v1/organisations/#{org.id}", headers: headers
        }.to change(Organisation, :count).by(-1)
      end

      it "nullifies organisation_id on linked jobs rather than deleting them" do
        job = create(:job, :wishlist, user: user, company_name: org.name, organisation: org)

        delete "/api/v1/organisations/#{org.id}", headers: headers

        expect(job.reload.organisation_id).to be_nil
      end
    end

    context "when the organisation belongs to another user" do
      let!(:other_org) { create(:organisation, user: create(:user)) }

      it "returns 404 Not Found" do
        delete "/api/v1/organisations/#{other_org.id}", headers: headers
        expect(response).to have_http_status(:not_found)
      end

      it "does not delete the organisation" do
        expect {
          delete "/api/v1/organisations/#{other_org.id}", headers: headers
        }.not_to change(Organisation, :count)
      end
    end
  end

  # ── PATCH /api/v1/organisations/:id/merge ────────────────────────────────────

  describe "PATCH /api/v1/organisations/:id/merge" do
    let!(:duplicate) { create(:organisation, user: user, name: "Acme Inc") }
    let!(:target)    { create(:organisation, user: user, name: "Acme") }

    context "without authentication" do
      it "returns 401" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with a valid target" do
      it "returns 200 OK" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "destroys the duplicate organisation" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers
        expect(Organisation.exists?(duplicate.id)).to be(false)
      end

      it "reassigns jobs from the duplicate to the target" do
        job = create(:job, :wishlist, user: user, company_name: duplicate.name, organisation: duplicate)

        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers

        expect(job.reload.organisation_id).to eq(target.id)
      end

      it "absorbs the duplicate name into the target's aliases" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers
        expect(target.reload.aliases).to include(duplicate.name)
      end
    end

    context "when target_id refers to another user's organisation" do
      let(:other_org) { create(:organisation, user: create(:user)) }

      it "returns 404 Not Found" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: other_org.id }.to_json,
              headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when merging an organisation into itself" do
      it "returns 422 Unprocessable Entity" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: duplicate.id }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when the merged alias list would exceed the limit" do
      before do
        target.update_columns(aliases: Array.new(Organisation::MAX_ALIASES, "Alias"))
      end

      it "returns 422 Unprocessable Entity" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns a descriptive error message" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers
        expect(json_response["errors"]).to be_present
      end

      it "does not destroy the duplicate" do
        patch "/api/v1/organisations/#{duplicate.id}/merge",
              params: { target_id: target.id }.to_json,
              headers: headers
        expect(Organisation.exists?(duplicate.id)).to be(true)
      end
    end
  end

  # ── GET /api/v1/organisations/:id/similar ────────────────────────────────────

  describe "GET /api/v1/organisations/:id/similar" do
    let!(:org)       { create(:organisation, user: user, name: "Acme") }
    let!(:similar)   { create(:organisation, user: user, name: "Acme Corp") }
    let!(:unrelated) { create(:organisation, user: user, name: "Totally Different") }

    context "without authentication" do
      it "returns 401" do
        get "/api/v1/organisations/#{org.id}/similar",
            headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with a valid token" do
      it "returns 200 OK" do
        get "/api/v1/organisations/#{org.id}/similar", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "returns orgs with similar names" do
        get "/api/v1/organisations/#{org.id}/similar", headers: headers
        returned_ids = json_response.map { |o| o["id"] }
        expect(returned_ids).to include(similar.id)
      end

      it "does not return the organisation itself" do
        get "/api/v1/organisations/#{org.id}/similar", headers: headers
        returned_ids = json_response.map { |o| o["id"] }
        expect(returned_ids).not_to include(org.id)
      end

      it "does not return unrelated organisations" do
        get "/api/v1/organisations/#{org.id}/similar", headers: headers
        returned_ids = json_response.map { |o| o["id"] }
        expect(returned_ids).not_to include(unrelated.id)
      end

      it "does not return another user's similar org" do
        create(:organisation, user: create(:user), name: "Acme Other")

        get "/api/v1/organisations/#{org.id}/similar", headers: headers
        returned_ids = json_response.map { |o| o["id"] }
        expect(returned_ids).to all(be_in(user.organisations.pluck(:id)))
      end
    end
  end

  # ── PATCH /api/v1/organisations/:id/dismiss_review ───────────────────────────

  describe "PATCH /api/v1/organisations/:id/dismiss_review" do
    let!(:org) { create(:organisation, :needs_review, user: user) }

    context "without authentication" do
      it "returns 401" do
        patch "/api/v1/organisations/#{org.id}/dismiss_review",
              headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with a valid token" do
      it "returns 200 OK" do
        patch "/api/v1/organisations/#{org.id}/dismiss_review", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "sets needs_review to false" do
        patch "/api/v1/organisations/#{org.id}/dismiss_review", headers: headers
        expect(org.reload.needs_review).to be(false)
      end

      it "returns the updated organisation" do
        patch "/api/v1/organisations/#{org.id}/dismiss_review", headers: headers
        expect(json_response["needs_review"]).to be(false)
      end
    end

    context "when the organisation belongs to another user" do
      let(:other_org) { create(:organisation, :needs_review, user: create(:user)) }

      it "returns 404 Not Found" do
        patch "/api/v1/organisations/#{other_org.id}/dismiss_review", headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
