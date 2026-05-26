# frozen_string_literal: true

class Api::V1::ResumeTemplatesController < Api::V1::AuthenticatedController
  before_action :set_template, only: [:show, :update, :destroy]

  def index
    templates = current_user.resume_templates
      .left_joins(:resume_variants)
      .select("resume_templates.*, COUNT(resume_variants.id) AS variant_count")
      .group("resume_templates.id")
      .order(:name)

    render json: templates.map { |t| template_json(t) }
  end

  def show
    render json: template_json(@template, include_variants: true)
  end

  def create
    if params[:pdf].present? && !valid_pdf?(params[:pdf])
      return render json: { errors: ["PDF must be a PDF file under 10MB."] }, status: :unprocessable_content
    end

    template = current_user.resume_templates.build(template_params)

    if template.save
      template.pdf.attach(params[:pdf]) if params[:pdf].present?
      render json: template_json(template), status: :created
    else
      render json: { errors: template.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if params[:pdf].present? && !valid_pdf?(params[:pdf])
      return render json: { errors: ["PDF must be a PDF file under 10MB."] }, status: :unprocessable_content
    end

    if @template.update(template_params)
      if params[:pdf].present?
        old_blob = @template.pdf.blob if @template.pdf.attached?
        @template.pdf.attach(params[:pdf])
        old_blob&.purge_later
      end
      render json: template_json(@template), status: :ok
    else
      render json: { errors: @template.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @template.destroy
    head :no_content
  end

  private

  def set_template
    @template = current_user.resume_templates.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resume template not found" }, status: :not_found
  end

  def template_params
    params.require(:resume_template).permit(:name, :notes)
  end

  def valid_pdf?(file)
    file.is_a?(ActionDispatch::Http::UploadedFile) &&
      file.content_type == "application/pdf" &&
      file.size <= 10.megabytes
  end

  def template_json(template, include_variants: false)
    json = {
      id:           template.id,
      name:         template.name,
      notes:        template.notes,
      variant_count: template.try(:variant_count).to_i,
      pdf_url:      pdf_url(template),
      pdf_filename: template.pdf.attached? ? template.pdf.filename.to_s : nil,
      created_at:   template.created_at,
      updated_at:   template.updated_at
    }

    json[:variants] = template.resume_variants.map { |v| variant_json(v, template_name: template.name) } if include_variants

    json
  end

  def variant_json(variant, template_name: nil)
    {
      id:                 variant.id,
      resume_template_id: variant.resume_template_id,
      template_name:      template_name || variant.resume_template.name,
      notes:              variant.notes,
      pdf_url:            pdf_url(variant),
      pdf_filename:       variant.pdf.attached? ? variant.pdf.filename.to_s : nil,
      created_at:         variant.created_at,
      updated_at:         variant.updated_at
    }
  end
end
