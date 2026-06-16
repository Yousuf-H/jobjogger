# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Contact Interactions API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:contact) { create(:contact, user: user) }

  # ── POST /api/v1/contacts/:contact_id/contact_interactions ───────────────────

  describe "POST /api/v1/contacts/:contact_id/contact_interactions" do
    let(:valid_params) do
      { contact_interaction: { interaction_type: "call", notes: "Quick chat", occurred_at: "2026-04-17T00:00:00Z" } }
    end

    include_examples "requires authentication" do
      let(:make_request_without_cookie)      { -> { post "/api/v1/contacts/#{contact.id}/contact_interactions", params: valid_params.to_json, headers: { "Content-Type" => "application/json" } } }
      let(:make_request_with_expired_cookie) { -> { set_auth_cookie(expired_jwt_for(user)); post "/api/v1/contacts/#{contact.id}/contact_interactions", params: valid_params.to_json, headers: { "Content-Type" => "application/json" } } }
    end

    it "creates an interaction" do
      expect {
        post "/api/v1/contacts/#{contact.id}/contact_interactions", params: valid_params.to_json, headers: headers
      }.to change(ContactInteraction, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "returns 404 for another user's contact" do
      other_contact = create(:contact, user: create(:user))
      post "/api/v1/contacts/#{other_contact.id}/contact_interactions", params: valid_params.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 422 for an invalid interaction_type" do
      post "/api/v1/contacts/#{contact.id}/contact_interactions",
           params: { contact_interaction: { interaction_type: "bogus", occurred_at: "2026-04-17T00:00:00Z" } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  # ── PATCH /api/v1/contacts/:contact_id/contact_interactions/:id ──────────────

  describe "PATCH /api/v1/contacts/:contact_id/contact_interactions/:id" do
    let(:interaction) { create(:contact_interaction, contact: contact) }

    include_examples "requires authentication" do
      let(:make_request_without_cookie)      { -> { patch "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}", params: { contact_interaction: { notes: "Updated" } }.to_json, headers: { "Content-Type" => "application/json" } } }
      let(:make_request_with_expired_cookie) { -> { set_auth_cookie(expired_jwt_for(user)); patch "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}", params: { contact_interaction: { notes: "Updated" } }.to_json, headers: { "Content-Type" => "application/json" } } }
    end

    it "updates the interaction" do
      patch "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}",
            params: { contact_interaction: { notes: "Updated notes", interaction_type: "email" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(interaction.reload.notes).to eq("Updated notes")
      expect(interaction.reload.interaction_type).to eq("email")
    end

    it "returns 404 for another user's contact" do
      other_contact     = create(:contact, user: create(:user))
      other_interaction = create(:contact_interaction, contact: other_contact)
      patch "/api/v1/contacts/#{other_contact.id}/contact_interactions/#{other_interaction.id}",
            params: { contact_interaction: { notes: "Hijacked" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 when the interaction does not belong to the contact" do
      other_contact      = create(:contact, user: user)
      unrelated_interaction = create(:contact_interaction, contact: other_contact)
      patch "/api/v1/contacts/#{contact.id}/contact_interactions/#{unrelated_interaction.id}",
            params: { contact_interaction: { notes: "Hijacked" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 422 for an invalid interaction_type" do
      patch "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}",
            params: { contact_interaction: { interaction_type: "bogus" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  # ── DELETE /api/v1/contacts/:contact_id/contact_interactions/:id ─────────────

  describe "DELETE /api/v1/contacts/:contact_id/contact_interactions/:id" do
    let!(:interaction) { create(:contact_interaction, contact: contact) }

    include_examples "requires authentication" do
      let(:make_request_without_cookie)      { -> { delete "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}" } }
      let(:make_request_with_expired_cookie) { -> { set_auth_cookie(expired_jwt_for(user)); delete "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}" } }
    end

    it "deletes the interaction" do
      expect {
        delete "/api/v1/contacts/#{contact.id}/contact_interactions/#{interaction.id}", headers: headers
      }.to change(ContactInteraction, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 for another user's contact" do
      other_contact     = create(:contact, user: create(:user))
      other_interaction = create(:contact_interaction, contact: other_contact)
      delete "/api/v1/contacts/#{other_contact.id}/contact_interactions/#{other_interaction.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
