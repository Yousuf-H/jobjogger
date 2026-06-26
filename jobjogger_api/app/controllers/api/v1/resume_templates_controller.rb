# frozen_string_literal: true

# @api Manages resume templates and their associated variants for the authenticated user.
class Api::V1::ResumeTemplatesController < Api::V1::AuthenticatedController
  before_action :set_template, only: [ :show, :update, :destroy ]

  def index
    templates = current_user.resume_templates
      .left_joins(:resume_variants)
      .select("resume_templates.*, COUNT(resume_variants.id) AS variant_count")
      .group("resume_templates.id")
      .order(:name)

    render json: templates.map { |t|
      {
        id:            t.id,
        name:          t.name,
        notes:         t.notes,
        variant_count: t.variant_count.to_i,
        pdf_url:       pdf_url(t),
        pdf_filename:  t.pdf.attached? ? t.pdf.filename.to_s : nil,
        created_at:    t.created_at,
        updated_at:    t.updated_at
      }
    }
  end

  def show
    variants = @template.resume_variants.includes(:jobs)

    render json: {
      id:            @template.id,
      name:          @template.name,
      notes:         @template.notes,
      variant_count: variants.length,
      pdf_url:       pdf_url(@template),
      pdf_filename:  @template.pdf.attached? ? @template.pdf.filename.to_s : nil,
      created_at:    @template.created_at,
      updated_at:    @template.updated_at,
      variants:      variants.map { |v|
        {
          id:                 v.id,
          resume_template_id: v.resume_template_id,
          template_name:      @template.name,
          notes:              v.notes,
          pdf_url:            pdf_url(v),
          pdf_filename:       v.pdf.attached? ? v.pdf.filename.to_s : nil,
          linked_jobs:        v.jobs.map { |j| { id: j.id, company_name: j.company_name, job_title: j.job_title } },
          created_at:         v.created_at,
          updated_at:         v.updated_at
        }
      }
    }
  end

  def create
    if params[:pdf].present? && !valid_pdf?(params[:pdf])
      return render json: { errors: [ "PDF must be a PDF file under 10MB." ] }, status: :unprocessable_content
    end

    template = current_user.resume_templates.build(template_params)

    if template.save
      template.pdf.attach(params[:pdf]) if params[:pdf].present?
      render json: {
        id:            template.id,
        name:          template.name,
        notes:         template.notes,
        variant_count: 0,
        pdf_url:       pdf_url(template),
        pdf_filename:  template.pdf.attached? ? template.pdf.filename.to_s : nil,
        created_at:    template.created_at,
        updated_at:    template.updated_at
      }, status: :created
    else
      render json: { errors: template.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if params[:pdf].present? && !valid_pdf?(params[:pdf])
      return render json: { errors: [ "PDF must be a PDF file under 10MB." ] }, status: :unprocessable_content
    end

    if @template.update(template_params)
      if params[:pdf].present?
        old_blob = @template.pdf.blob if @template.pdf.attached?
        @template.pdf.attach(params[:pdf])
        old_blob&.purge_later
      end
      render json: {
        id:            @template.id,
        name:          @template.name,
        notes:         @template.notes,
        variant_count: @template.resume_variants.count,
        pdf_url:       pdf_url(@template),
        pdf_filename:  @template.pdf.attached? ? @template.pdf.filename.to_s : nil,
        created_at:    @template.created_at,
        updated_at:    @template.updated_at
      }, status: :ok
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
end
