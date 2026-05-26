# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Resume Templates API", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers_for(user) }

  # ── GET /api/v1/resume_templates ─────────────────────────────────────────────

  describe "GET /api/v1/resume_templates" do
    include_examples "requires authentication" do
      let(:make_request_without_cookie) { -> { get "/api/v1/resume_templates" } }
      let(:make_request_with_expired_cookie) do
        -> { set_auth_cookie(expired_jwt_for(user)); get "/api/v1/resume_templates" }
      end
    end

    context "with a valid token" do
      let!(:t1) { create(:resume_template, user: user, name: "Backend") }
      let!(:t2) { create(:resume_template, user: user, name: "Frontend") }

      before { 2.times { create(:resume_variant, resume_template: t1, user: user) } }

      it "returns 200 OK" do
        get "/api/v1/resume_templates", headers: headers
        expect(response).to have_http_status(:ok)
      end

      it "returns only the current user's templates" do
        create(:resume_template, user: create(:user))
        get "/api/v1/resume_templates", headers: headers
        expect(json_response.map { |t| t["id"] }).to match_array([t1.id, t2.id])
      end

      it "returns templates sorted alphabetically" do
        get "/api/v1/resume_templates", headers: headers
        names = json_response.map { |t| t["name"] }
        expect(names).to eq(names.sort)
      end

      it "includes variant_count" do
        get "/api/v1/resume_templates", headers: headers
        t1_data = json_response.find { |t| t["id"] == t1.id }
        expect(t1_data["variant_count"]).to eq(2)
      end

      it "includes expected attributes" do
        get "/api/v1/resume_templates", headers: headers
        expect(json_response.first).to include("id", "name", "notes", "variant_count", "pdf_url", "pdf_filename")
      end
    end
  end

  # ── GET /api/v1/resume_templates/:id ─────────────────────────────────────────

  describe "GET /api/v1/resume_templates/:id" do
    let!(:template) { create(:resume_template, user: user) }

    include_examples "user-scoped resource" do
      let(:make_request_for_other_user) do
        other = create(:resume_template, user: create(:user))
        -> { get "/api/v1/resume_templates/#{other.id}", headers: headers }
      end
    end

    it "returns 200 and embeds variants" do
      create(:resume_variant, resume_template: template, user: user)
      get "/api/v1/resume_templates/#{template.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response["variants"]).to be_an(Array)
      expect(json_response["variants"].first).to include("id", "notes", "pdf_url")
    end
  end

  # ── POST /api/v1/resume_templates ────────────────────────────────────────────

  describe "POST /api/v1/resume_templates" do
    it "creates a template and returns 201" do
      expect {
        post "/api/v1/resume_templates",
             params: { resume_template: { name: "My Resume", notes: "General purpose" } }.to_json,
             headers: headers
      }.to change(ResumeTemplate, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(json_response["name"]).to eq("My Resume")
    end

    it "returns 422 when name is blank" do
      post "/api/v1/resume_templates",
           params: { resume_template: { name: "" } }.to_json,
           headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    context "with a PDF upload" do
      let(:pdf) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.pdf"), "application/pdf") }

      it "attaches the PDF and returns 201" do
        # multipart: omit Content-Type so Rails sets it automatically for the upload
        post "/api/v1/resume_templates",
             params: { resume_template: { name: "With PDF" }, pdf: pdf },
             headers: headers.except("Content-Type")
        expect(response).to have_http_status(:created)
        expect(ResumeTemplate.last.pdf).to be_attached
      end
    end

    context "with an invalid file type" do
      let(:bad_file) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.pdf"), "image/png") }

      it "returns 422 without creating a record" do
        expect {
          post "/api/v1/resume_templates",
               params: { resume_template: { name: "Bad file" }, pdf: bad_file },
               headers: headers.except("Content-Type")
        }.not_to change(ResumeTemplate, :count)
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  # ── PATCH /api/v1/resume_templates/:id ───────────────────────────────────────

  describe "PATCH /api/v1/resume_templates/:id" do
    let!(:template) { create(:resume_template, user: user, name: "Old Name") }

    include_examples "user-scoped resource" do
      let(:make_request_for_other_user) do
        other = create(:resume_template, user: create(:user))
        -> { patch "/api/v1/resume_templates/#{other.id}", params: { resume_template: { name: "X" } }.to_json, headers: headers }
      end
    end

    it "updates name and returns 200" do
      patch "/api/v1/resume_templates/#{template.id}",
            params: { resume_template: { name: "New Name" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(template.reload.name).to eq("New Name")
    end
  end

  # ── DELETE /api/v1/resume_templates/:id ──────────────────────────────────────

  describe "DELETE /api/v1/resume_templates/:id" do
    let!(:template) { create(:resume_template, user: user) }

    include_examples "user-scoped resource" do
      let(:make_request_for_other_user) do
        other = create(:resume_template, user: create(:user))
        -> { delete "/api/v1/resume_templates/#{other.id}", headers: headers }
      end
    end

    it "destroys the template and its variants" do
      create(:resume_variant, resume_template: template, user: user)
      expect {
        delete "/api/v1/resume_templates/#{template.id}", headers: headers
      }.to change(ResumeTemplate, :count).by(-1)
        .and change(ResumeVariant, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
