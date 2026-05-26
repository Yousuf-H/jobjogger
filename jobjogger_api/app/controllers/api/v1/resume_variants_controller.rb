# frozen_string_literal: true

class Api::V1::ResumeVariantsController < Api::V1::AuthenticatedController
  before_action :set_template, only: [:index, :create]
  before_action :set_variant,  only: [:show, :update, :destroy]

  def index
    render json: @template.resume_variants.map { |v| variant_json(v) }
  end

  def show
    render json: variant_json(@variant)
  end

  def create
    if params[:pdf].present? && !valid_pdf?(params[:pdf])
      return render json: { errors: ["PDF must be a PDF file under 10MB."] }, status: :unprocessable_content
    end

    variant = @template.resume_variants.build(variant_params.merge(user: current_user))

    if variant.save
      variant.pdf.attach(params[:pdf]) if params[:pdf].present?
      render json: variant_json(variant), status: :created
    else
      render json: { errors: variant.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if params[:pdf].present? && !valid_pdf?(params[:pdf])
      return render json: { errors: ["PDF must be a PDF file under 10MB."] }, status: :unprocessable_content
    end

    if @variant.update(variant_params)
      if params[:pdf].present?
        old_blob = @variant.pdf.blob if @variant.pdf.attached?
        @variant.pdf.attach(params[:pdf])
        old_blob&.purge_later
      end
      render json: variant_json(@variant), status: :ok
    else
      render json: { errors: @variant.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @variant.destroy
    head :no_content
  end

  private

  def set_template
    @template = current_user.resume_templates.find(params[:resume_template_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resume template not found" }, status: :not_found
  end

  def set_variant
    @variant = current_user.resume_variants.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resume variant not found" }, status: :not_found
  end

  def variant_params
    params.require(:resume_variant).permit(:notes)
  end

  def valid_pdf?(file)
    file.is_a?(ActionDispatch::Http::UploadedFile) &&
      file.content_type == "application/pdf" &&
      file.size <= 10.megabytes
  end

  def variant_json(variant)
    {
      id:                 variant.id,
      resume_template_id: variant.resume_template_id,
      notes:              variant.notes,
      pdf_url:            pdf_url(variant),
      pdf_filename:       variant.pdf.attached? ? variant.pdf.filename.to_s : nil,
      created_at:         variant.created_at,
      updated_at:         variant.updated_at
    }
  end
end
