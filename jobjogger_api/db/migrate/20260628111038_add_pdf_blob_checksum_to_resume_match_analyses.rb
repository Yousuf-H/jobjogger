# frozen_string_literal: true

class AddPdfBlobChecksumToResumeMatchAnalyses < ActiveRecord::Migration[8.1]
  def change
    # null: true so existing rows aren't broken; the service always sets it going forward.
    # A nil checksum is treated as stale by ResumeMatchAnalysis#fresh_for?.
    add_column :resume_match_analyses, :pdf_blob_checksum, :string
  end
end
