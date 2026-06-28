# frozen_string_literal: true

# Stores the latest AI match analysis for a job.
#
# One record per job (enforced by the unique index on job_id). When the linked
# resume variant, its PDF, or the job description changes, the service computes
# a fresh analysis and upserts this record, replacing the stale one.
#
# @see Ai::ResumeMatchService
class ResumeMatchAnalysis < ApplicationRecord
  belongs_to :job
  belongs_to :resume_variant

  validates :job_description_digest, presence: true
  validates :score, presence: true
  validates :strengths, presence: true
  validates :weaknesses, presence: true
  validates :missing_keywords, presence: true

  # Returns a stable digest for any string, used to detect job description changes.
  #
  # @param text [String]
  # @return [String] 64-character hex SHA-256 digest
  def self.digest_for(text)
    Digest::SHA256.hexdigest(text)
  end

  # Returns true when this record still matches the job's current state.
  #
  # Checks resume_variant_id, job_description_digest, and pdf_blob_checksum.
  # A nil pdf_blob_checksum (legacy row) is always treated as stale.
  #
  # @param job [Job]
  # @return [Boolean]
  def fresh_for?(job)
    return false if resume_variant_id != job.resume_variant_id
    return false if job_description_digest != self.class.digest_for(job.job_description.to_s)
    return false if pdf_blob_checksum.nil?
    return false unless job.resume_variant&.pdf&.attached?
    pdf_blob_checksum == job.resume_variant.pdf.blob.checksum
  end
end
