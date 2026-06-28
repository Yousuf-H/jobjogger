# frozen_string_literal: true

# Stores the latest AI match analysis for a job.
#
# One record per job (enforced by the unique index on job_id). When the linked
# resume variant or job description changes, the service computes a fresh
# analysis and upserts this record, replacing the stale one.
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
end
