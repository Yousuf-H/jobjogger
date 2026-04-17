# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Job Contacts API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:job)     { create(:job, user: user) }
  let(:contact) { create(:contact, user: user) }

  # ── GET /api/v1/jobs/:job_id/job_contacts ─────────────────────────────────────

  describe "GET /api/v1/jobs/:job_id/job_contacts" do
    before { Contacts::Link.new(contact: contact, job: job).call }

    it "returns contacts linked to the job" do
      get "/api/v1/jobs/#{job.id}/job_contacts", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response.map { |c| c["id"] }).to include(contact.id)
    end

    it "returns 404 for another user's job" do
      other_job = create(:job, user: create(:user))
      get "/api/v1/jobs/#{other_job.id}/job_contacts", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── POST /api/v1/jobs/:job_id/job_contacts ────────────────────────────────────

  describe "POST /api/v1/jobs/:job_id/job_contacts" do
    it "links a contact to the job" do
      post "/api/v1/jobs/#{job.id}/job_contacts",
           params: { contact_id: contact.id }.to_json,
           headers: headers
      expect(response).to have_http_status(:ok)
      expect(job.contacts.reload).to include(contact)
    end

    it "is idempotent — linking twice does not duplicate" do
      Contacts::Link.new(contact: contact, job: job).call
      expect {
        post "/api/v1/jobs/#{job.id}/job_contacts",
             params: { contact_id: contact.id }.to_json,
             headers: headers
      }.not_to change(ContactJob, :count)
    end

    it "returns 404 for a contact that doesn't belong to the user" do
      other_contact = create(:contact, user: create(:user))
      post "/api/v1/jobs/#{job.id}/job_contacts",
           params: { contact_id: other_contact.id }.to_json,
           headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── DELETE /api/v1/jobs/:job_id/job_contacts/:id ──────────────────────────────

  describe "DELETE /api/v1/jobs/:job_id/job_contacts/:id" do
    before { Contacts::Link.new(contact: contact, job: job).call }

    it "unlinks the contact from the job" do
      delete "/api/v1/jobs/#{job.id}/job_contacts/#{contact.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(job.contacts.reload).not_to include(contact)
    end

    it "destroys an orphaned contact (no org, no jobs, no interactions)" do
      expect {
        delete "/api/v1/jobs/#{job.id}/job_contacts/#{contact.id}", headers: headers
      }.to change(Contact, :count).by(-1)
    end

    it "keeps the contact when it belongs to an org" do
      org_contact = create(:contact, :with_organisation, user: user)
      Contacts::Link.new(contact: org_contact, job: job).call

      expect {
        delete "/api/v1/jobs/#{job.id}/job_contacts/#{org_contact.id}", headers: headers
      }.not_to change(Contact, :count)
    end
  end
end
