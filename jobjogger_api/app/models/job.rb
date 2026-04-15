class Job < ApplicationRecord
  belongs_to :user
  has_many :timeline_entries, -> { order(occurred_at: :desc) }, dependent: :destroy
  belongs_to :organisation, optional: true
  has_many :contact_jobs, dependent: :destroy
  has_many :contacts, through: :contact_jobs

  TERMINAL_STATUSES = %w[accepted rejected ghosted withdrawn].freeze

  # Pipeline order for detecting skipped stages
  PIPELINE_ORDER = %w[wishlist applied phone_screen interviewing offer accepted].freeze

  enum :status, {
      wishlist: 'wishlist',
      applied: 'applied',
      phone_screen: 'phone_screen',
      interviewing: 'interviewing',
      offer: 'offer',
      accepted: 'accepted',
      rejected: 'rejected',
      ghosted: 'ghosted',
      withdrawn: 'withdrawn'
    }

  enum :priority, {
      low: 'low',
      medium: 'medium',
      high: 'high'
    }

  enum :employment_type, {
      full_time: 'full_time',
      part_time: 'part_time',
      casual: 'casual',
      contract: 'contract'
    }

  enum :source, {
      seek: 'seek',
      linkedin: 'linkedin',
      referral: 'referral',
      company_site: 'company_site',
      other: 'other'
    }

  validates :company_name, presence: true
  validates :job_title, presence: true
  validates :status, presence: true

  before_validation :normalise_job_url
  validate :valid_url_format
  validates :job_url, uniqueness: { scope: :user_id }, allow_nil: true
  validates :source_other, presence: true, if: :other_source?

  scope :active, -> { where(archived_at: nil).where.not(status: TERMINAL_STATUSES) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :overdue, -> { where("follow_up_date < ?", Date.current) }
  scope :due_this_week, -> { where(follow_up_date: Date.current..Date.current.end_of_week(:sunday)) }

  before_save :normalise_tags
  before_update :set_date_applied_if_needed
  after_create_commit :create_initial_timeline_entry
  after_update_commit :auto_create_timeline_entry

  def archive!
    update(archived_at: Time.current)
  end

  def unarchive!
    update(archived_at: nil)
  end

  private

  def valid_url_format
    return if job_url.blank?

    uri = URI.parse(job_url)
    unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
      errors.add(:job_url, "is not a valid URL")
    end
  rescue URI::InvalidURIError
    errors.add(:job_url, "is not a valid URL")
  end

  def normalise_job_url
    return if job_url.blank?
    return if job_url.start_with?('http://', 'https://')

    self.job_url = "https://#{job_url}"
  end

  def other_source?
    source == "other"
  end

  def normalise_tags
    self.tags = tags&.map { |tag| tag.downcase.strip.gsub(/\s+/, "-") }.reject(&:empty?).uniq
  end

  def set_date_applied_if_needed
    return unless will_save_change_to_status?
    return unless applied?
    return unless date_applied.blank?

    self.date_applied = Date.current
  end

  # Called after create — records timeline entries for jobs created beyond wishlist.
  # Only creates entries for the actual status, plus an applied entry if the job
  # skipped past applied (since we know it must have been applied at some point).
  # Does NOT fabricate intermediate stages (phone_screen, interviewing, etc.)
  # because we don't know when those happened — synthetic timestamps would
  # pollute the stage duration analytics.
  def create_initial_timeline_entry
    return if wishlist?

    timestamp = date_applied.present? ? date_applied.beginning_of_day : created_at

    if applied?
      # Simple case: job created as applied
      timeline_entries.create!(
        entry_type: "status_change",
        description: "Job created as applied",
        occurred_at: timestamp,
        metadata: { from: nil, to: "applied" }
      )
    else
      # Job created beyond applied — create an applied entry first
      # (we know it must have been applied at some point)
      timeline_entries.create!(
        entry_type: "status_change",
        description: "Job created as applied",
        occurred_at: timestamp,
        metadata: { from: nil, to: "applied" }
      )

      timeline_entries.create!(
        entry_type: "status_change",
        description: "Job created as #{status}",
        occurred_at: timestamp + 1.second,
        metadata: { from: "applied", to: status }
      )
    end
  end

  # Called after update — records the status change, plus synthesizes an
  # applied entry if the job jumped from wishlist to a stage beyond applied.
  def auto_create_timeline_entry
    return unless saved_change_to_status?

    from_status = status_before_last_save
    to_status = status

    # If jumping from wishlist past applied, create an applied entry first
    # so the analytics can track the application start point
    if from_status == "wishlist" && to_status != "applied"
      timeline_entries.create!(
        entry_type: "status_change",
        description: "Status changed from wishlist to applied",
        occurred_at: updated_at,
        metadata: { from: "wishlist", to: "applied" }
      )

      timeline_entries.create!(
        entry_type: "status_change",
        description: "Status changed from applied to #{to_status}",
        occurred_at: updated_at + 1.second,
        metadata: { from: "applied", to: to_status }
      )
    else
      timeline_entries.create!(
        entry_type: "status_change",
        description: "Status changed from #{from_status} to #{to_status}",
        occurred_at: updated_at,
        metadata: { from: from_status, to: to_status }
      )
    end
  end
end
