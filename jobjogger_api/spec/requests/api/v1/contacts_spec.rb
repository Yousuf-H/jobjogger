# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Contacts API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # ── GET /api/v1/contacts ──────────────────────────────────────────────────────

  describe "GET /api/v1/contacts" do
    before { create_list(:contact, 3, user: user) }

    context "without authentication" do
      it "returns 401" do
        get "/api/v1/contacts", headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    it "returns all contacts for the current user" do
      get "/api/v1/contacts", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response.size).to eq(3)
    end

    it "does not return another user's contacts" do
      create(:contact, user: create(:user))
      get "/api/v1/contacts", headers: headers
      expect(json_response.size).to eq(3)
    end

    context "search filter" do
      it "filters by name" do
        create(:contact, user: user, name: "Grace Hopper")
        get "/api/v1/contacts", params: { search: "Grace" }, headers: headers
        names = json_response.map { |c| c["name"] }
        expect(names).to include("Grace Hopper")
        expect(names.size).to eq(1)
      end

      it "filters by email" do
        create(:contact, user: user, email: "grace@navy.mil")
        get "/api/v1/contacts", params: { search: "grace@navy" }, headers: headers
        expect(json_response.size).to eq(1)
      end
    end

    context "organisation_id filter" do
      it "returns only contacts belonging to that organisation" do
        org          = create(:organisation, user: user)
        org_contact  = create(:contact, user: user, organisation: org)
        _other       = create(:contact, user: user)

        get "/api/v1/contacts", params: { organisation_id: org.id }, headers: headers
        expect(json_response.map { |c| c["id"] }).to eq([org_contact.id])
      end
    end
  end

  # ── GET /api/v1/contacts/:id ──────────────────────────────────────────────────

  describe "GET /api/v1/contacts/:id" do
    let(:contact) { create(:contact, :with_interactions, user: user) }

    it "returns the contact with interactions" do
      get "/api/v1/contacts/#{contact.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response["id"]).to eq(contact.id)
      expect(json_response["contact_interactions"]).to be_an(Array)
    end

    it "returns 404 for another user's contact" do
      other = create(:contact, user: create(:user))
      get "/api/v1/contacts/#{other.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── POST /api/v1/contacts ─────────────────────────────────────────────────────

  describe "POST /api/v1/contacts" do
    let(:valid_params) do
      { contact: { name: "Grace Hopper", role: "Engineer", email: "grace@navy.mil" } }
    end

    it "creates a contact" do
      expect {
        post "/api/v1/contacts", params: valid_params.to_json, headers: headers
      }.to change(user.contacts, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "links to an organisation when organisation_id is provided" do
      org = create(:organisation, user: user)
      post "/api/v1/contacts",
           params: { contact: valid_params[:contact].merge(organisation_id: org.id) }.to_json,
           headers: headers
      expect(json_response["organisation_id"]).to eq(org.id)
    end

    it "returns existing contact instead of creating a duplicate" do
      create(:contact, user: user, name: "Grace Hopper")
      expect {
        post "/api/v1/contacts", params: valid_params.to_json, headers: headers
      }.not_to change(user.contacts, :count)
      expect(response).to have_http_status(:created)
    end

    it "returns 422 when name is missing" do
      post "/api/v1/contacts",
           params: { contact: { role: "Engineer" } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  # ── PATCH /api/v1/contacts/:id ────────────────────────────────────────────────

  describe "PATCH /api/v1/contacts/:id" do
    let(:contact) { create(:contact, user: user) }

    it "updates the contact" do
      patch "/api/v1/contacts/#{contact.id}",
            params: { contact: { role: "CTO" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(contact.reload.role).to eq("CTO")
    end

    it "returns 404 for another user's contact" do
      other = create(:contact, user: create(:user))
      patch "/api/v1/contacts/#{other.id}",
            params: { contact: { role: "CTO" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── DELETE /api/v1/contacts/:id ───────────────────────────────────────────────

  describe "DELETE /api/v1/contacts/:id" do
    let!(:contact) { create(:contact, user: user) }

    it "deletes the contact" do
      expect {
        delete "/api/v1/contacts/#{contact.id}", headers: headers
      }.to change(user.contacts, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for another user's contact" do
      other = create(:contact, user: create(:user))
      delete "/api/v1/contacts/#{other.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── POST /api/v1/contacts/:contact_id/contact_interactions ───────────────────

  describe "POST /api/v1/contacts/:contact_id/contact_interactions" do
    let(:contact) { create(:contact, user: user) }
    let(:valid_params) do
      { contact_interaction: { interaction_type: "email", notes: "Followed up", occurred_at: Time.current } }
    end

    it "creates an interaction" do
      expect {
        post "/api/v1/contacts/#{contact.id}/contact_interactions",
             params: valid_params.to_json,
             headers: headers
      }.to change(contact.contact_interactions, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "returns 422 with an invalid interaction_type" do
      post "/api/v1/contacts/#{contact.id}/contact_interactions",
           params: { contact_interaction: { interaction_type: "fax", occurred_at: Time.current } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 404 for another user's contact" do
      other = create(:contact, user: create(:user))
      post "/api/v1/contacts/#{other.id}/contact_interactions",
           params: valid_params.to_json,
           headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── DELETE /api/v1/contacts/:contact_id/contact_interactions/:id ─────────────

  describe "DELETE /api/v1/contacts/:contact_id/contact_interactions/:id" do
    let(:contact)     { create(:contact, user: user) }
    let!(:interaction) { create(:contact_interaction, contact: contact) }

    it "deletes the interaction" do
      expect {
        delete "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}",
               headers: headers
      }.to change(contact.contact_interactions, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
