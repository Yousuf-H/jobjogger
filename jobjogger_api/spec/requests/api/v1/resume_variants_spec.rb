# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Resume Variants API", type: :request do
  let(:user)     { create(:user) }
  let(:headers)  { auth_headers_for(user) }
  let(:template) { create(:resume_template, user: user) }

  # ── GET /api/v1/resume_templates/:id/resume_variants ─────────────────────────

  describe "GET /api/v1/resume_templates/:resume_template_id/resume_variants" do
    let!(:v1) { create(:resume_variant, resume_template: template, user: user) }
    let!(:v2) { create(:resume_variant, resume_template: template, user: user) }

    include_examples "requires authentication" do
      let(:make_request_without_cookie) do
        -> { get "/api/v1/resume_templates/#{template.id}/resume_variants" }
      end
      let(:make_request_with_expired_cookie) do
        -> { set_auth_cookie(expired_jwt_for(user)); get "/api/v1/resume_templates/#{template.id}/resume_variants" }
      end
    end

    it "returns only variants belonging to the template" do
      other_template = create(:resume_template, user: user)
      create(:resume_variant, resume_template: other_template, user: user)

      get "/api/v1/resume_templates/#{template.id}/resume_variants", headers: headers
      expect(json_response.map { |v| v["id"] }).to match_array([ v1.id, v2.id ])
    end

    it "returns 404 when the template belongs to another user" do
      other_template = create(:resume_template, user: create(:user))
      get "/api/v1/resume_templates/#{other_template.id}/resume_variants", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "includes expected attributes" do
      get "/api/v1/resume_templates/#{template.id}/resume_variants", headers: headers
      expect(json_response.first).to include("id", "resume_template_id", "notes", "pdf_url", "pdf_filename")
    end
  end

  # ── POST /api/v1/resume_templates/:id/resume_variants ────────────────────────

  describe "POST /api/v1/resume_templates/:resume_template_id/resume_variants" do
    it "creates a variant scoped to the template and returns 201" do
      expect {
        post "/api/v1/resume_templates/#{template.id}/resume_variants",
             params: { resume_variant: { notes: "Tailored for fintech" } }.to_json,
             headers: headers
      }.to change(ResumeVariant, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(json_response["resume_template_id"]).to eq(template.id)
    end

    it "returns 404 when the template belongs to another user" do
      other_template = create(:resume_template, user: create(:user))
      post "/api/v1/resume_templates/#{other_template.id}/resume_variants",
           params: { resume_variant: { notes: "X" } }.to_json,
           headers: headers
      expect(response).to have_http_status(:not_found)
    end

    context "with a PDF upload" do
      let(:pdf) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.pdf"), "application/pdf") }

      it "attaches the PDF" do
        post "/api/v1/resume_templates/#{template.id}/resume_variants",
             params: { resume_variant: { notes: "With PDF" }, pdf: pdf },
             headers: headers.except("Content-Type")
        expect(response).to have_http_status(:created)
        expect(ResumeVariant.last.pdf).to be_attached
      end
    end

    context "with an invalid file type" do
      let(:bad_file) { fixture_file_upload(Rails.root.join("spec/fixtures/files/test.pdf"), "image/png") }

      it "returns 422" do
        post "/api/v1/resume_templates/#{template.id}/resume_variants",
             params: { resume_variant: { notes: "X" }, pdf: bad_file },
             headers: headers.except("Content-Type")
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  # ── GET /api/v1/resume_variants/:id ──────────────────────────────────────────

  describe "GET /api/v1/resume_variants/:id" do
    let!(:variant) { create(:resume_variant, resume_template: template, user: user) }

    include_examples "user-scoped resource" do
      let(:make_request_for_other_user) do
        other_user = create(:user)
        other = create(:resume_variant, resume_template: create(:resume_template, user: other_user), user: other_user)
        -> { get "/api/v1/resume_variants/#{other.id}", headers: headers }
      end
    end

    it "returns 200 with the variant" do
      get "/api/v1/resume_variants/#{variant.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(json_response["id"]).to eq(variant.id)
    end
  end

  # ── PATCH /api/v1/resume_variants/:id ────────────────────────────────────────

  describe "PATCH /api/v1/resume_variants/:id" do
    let!(:variant) { create(:resume_variant, resume_template: template, user: user, notes: "Old") }

    include_examples "user-scoped resource" do
      let(:make_request_for_other_user) do
        other_user = create(:user)
        other = create(:resume_variant, resume_template: create(:resume_template, user: other_user), user: other_user)
        -> { patch "/api/v1/resume_variants/#{other.id}", params: { resume_variant: { notes: "X" } }.to_json, headers: headers }
      end
    end

    it "updates notes and returns 200" do
      patch "/api/v1/resume_variants/#{variant.id}",
            params: { resume_variant: { notes: "Updated notes" } }.to_json,
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(variant.reload.notes).to eq("Updated notes")
    end
  end

  # ── DELETE /api/v1/resume_variants/:id ───────────────────────────────────────

  describe "DELETE /api/v1/resume_variants/:id" do
    let!(:variant) { create(:resume_variant, resume_template: template, user: user) }

    include_examples "user-scoped resource" do
      let(:make_request_for_other_user) do
        other_user = create(:user)
        other = create(:resume_variant, resume_template: create(:resume_template, user: other_user), user: other_user)
        -> { delete "/api/v1/resume_variants/#{other.id}", headers: headers }
      end
    end

    it "destroys the variant and nullifies job references" do
      job = create(:job, user: user, resume_variant: variant)
      expect {
        delete "/api/v1/resume_variants/#{variant.id}", headers: headers
      }.to change(ResumeVariant, :count).by(-1)
      expect(response).to have_http_status(:no_content)
      expect(job.reload.resume_variant_id).to be_nil
    end
  end
end
