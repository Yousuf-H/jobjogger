# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Timeline Entries API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:job)     { create(:job, user: user) }

  # ── POST /api/v1/jobs/:job_id/timeline_entries (create) ──────────────────────

  describe "POST /api/v1/jobs/:job_id/timeline_entries" do
    let(:valid_params) do
      {
        timeline_entry: {
          entry_type:  "note",
          description: "Had a great initial call with the hiring manager.",
          occurred_at: Time.current.iso8601
        }
      }
    end

    context "with valid parameters" do
      it "returns 201 Created" do
        post "/api/v1/jobs/#{job.id}/timeline_entries",
             params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:created)
      end

      it "creates a timeline entry for the job" do
        expect {
          post "/api/v1/jobs/#{job.id}/timeline_entries",
               params: valid_params.to_json, headers: headers
        }.to change(job.timeline_entries, :count).by(1)
      end

      it "returns the created entry in the response" do
        post "/api/v1/jobs/#{job.id}/timeline_entries",
             params: valid_params.to_json, headers: headers
        body = json_response
        expect(body["description"]).to eq(valid_params[:timeline_entry][:description])
        expect(body["entry_type"]).to eq("note")
      end

      it "stores metadata when provided" do
        params_with_meta = valid_params.deep_merge(
          timeline_entry: { metadata: { interviewer: "Jane", format: "video" } }
        )
        post "/api/v1/jobs/#{job.id}/timeline_entries",
              params: params_with_meta.to_json, headers: headers
        entry = TimelineEntry.last

        expect(entry.metadata["interviewer"]).to eq("Jane")
      end

      it "accepts all valid entry_type values" do
        %w[note contact interview assessment follow_up].each do |type|
          params = valid_params.deep_merge(timeline_entry: { entry_type: type })
          post "/api/v1/jobs/#{job.id}/timeline_entries",
               params: params.to_json, headers: headers
          expect(response).to have_http_status(:created), "Failed for entry_type: #{type}"
        end
      end
    end

    context "with invalid parameters" do
      it "returns 422 when description is missing" do
        post "/api/v1/jobs/#{job.id}/timeline_entries",
             params: { timeline_entry: { entry_type: "note", description: "", occurred_at: Time.current } }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to be_present
      end

      it "returns 422 when entry_type is missing" do
        post "/api/v1/jobs/#{job.id}/timeline_entries",
             params: { timeline_entry: { entry_type: nil, description: "Something", occurred_at: Time.current } }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns 422 when description exceeds 1000 characters" do
        post "/api/v1/jobs/#{job.id}/timeline_entries",
             params: { timeline_entry: { entry_type: "note", description: "x" * 1001, occurred_at: Time.current } }.to_json,
             headers: headers
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "does not create an entry on failure" do
        expect {
          post "/api/v1/jobs/#{job.id}/timeline_entries",
               params: { timeline_entry: { entry_type: "note", description: "" } }.to_json,
               headers: headers
        }.not_to change(TimelineEntry, :count)
      end
    end

    context "when the job belongs to another user" do
      let(:other_job) { create(:job, user: create(:user)) }

      it "returns 404 Not Found" do
        post "/api/v1/jobs/#{other_job.id}/timeline_entries",
             params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:not_found)
        expect(json_response["error"]).to match(/job not found/i)
      end

      it "does not create a timeline entry" do
        expect {
          post "/api/v1/jobs/#{other_job.id}/timeline_entries",
               params: valid_params.to_json, headers: headers
        }.not_to change(TimelineEntry, :count)
      end
    end

    context "when the job does not exist" do
      it "returns 404 Not Found" do
        post "/api/v1/jobs/999999/timeline_entries",
             params: valid_params.to_json, headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "without authentication" do
      it "returns 401" do
        post "/api/v1/jobs/#{job.id}/timeline_entries",
             params: valid_params.to_json,
             headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── PATCH /api/v1/timeline_entries/:id (update) ───────────────────────────────

  describe "PATCH /api/v1/timeline_entries/:id" do
    let(:entry) { create(:timeline_entry, :note, job: job) }

    context "with valid parameters" do
      it "returns 200 OK" do
        patch "/api/v1/timeline_entries/#{entry.id}",
              params: { timeline_entry: { description: "Updated note." } }.to_json,
              headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "updates the entry's description" do
        patch "/api/v1/timeline_entries/#{entry.id}",
              params: { timeline_entry: { description: "Updated note." } }.to_json,
              headers: headers
        expect(entry.reload.description).to eq("Updated note.")
      end

      it "returns the updated entry" do
        patch "/api/v1/timeline_entries/#{entry.id}",
              params: { timeline_entry: { description: "Updated." } }.to_json,
              headers: headers
        expect(json_response["description"]).to eq("Updated.")
      end
    end

    context "when attempting to edit a status_change entry" do
      let(:status_entry) { create(:timeline_entry, :status_change, job: job) }

      it "returns 422 Unprocessable Entity" do
        patch "/api/v1/timeline_entries/#{status_entry.id}",
              params: { timeline_entry: { description: "Hacked description" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response["errors"]).to include(match(/Cannot edit auto-generated status change entries/))
      end

      it "does not modify the entry" do
        original_desc = status_entry.description
        patch "/api/v1/timeline_entries/#{status_entry.id}",
              params: { timeline_entry: { description: "Hacked" } }.to_json,
              headers: headers
        expect(status_entry.reload.description).to eq(original_desc)
      end
    end

    context "when the entry belongs to another user's job" do
      let(:other_entry) { create(:timeline_entry, :note, job: create(:job, user: create(:user))) }

      it "returns 404 Not Found" do
        patch "/api/v1/timeline_entries/#{other_entry.id}",
              params: { timeline_entry: { description: "Hack" } }.to_json,
              headers: headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "without authentication" do
      it "returns 401" do
        patch "/api/v1/timeline_entries/#{entry.id}",
              params: { timeline_entry: { description: "Updated" } }.to_json,
              headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── DELETE /api/v1/timeline_entries/:id (destroy) ─────────────────────────────

  describe "DELETE /api/v1/timeline_entries/:id" do
    let!(:entry) { create(:timeline_entry, :note, job: job) }

    context "when the entry belongs to the current user's job" do
      it "returns 204 No Content" do
        delete "/api/v1/timeline_entries/#{entry.id}", headers: headers
        expect(response).to have_http_status(:no_content)
      end

      it "deletes the timeline entry" do
        expect {
          delete "/api/v1/timeline_entries/#{entry.id}", headers: headers
        }.to change(TimelineEntry, :count).by(-1)
      end
    end

    context "when the entry belongs to another user's job" do
      let!(:other_entry) { create(:timeline_entry, :note, job: create(:job, user: create(:user))) }

      it "returns 404 Not Found" do
        delete "/api/v1/timeline_entries/#{other_entry.id}", headers: headers
        expect(response).to have_http_status(:not_found)
      end

      it "does not delete the entry" do
        expect {
          delete "/api/v1/timeline_entries/#{other_entry.id}", headers: headers
        }.not_to change(TimelineEntry, :count)
      end
    end

    context "without authentication" do
      it "returns 401" do
        delete "/api/v1/timeline_entries/#{entry.id}",
               headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
