class Job < ApplicationRecord
  belongs_to :user
  has_many :timeline_entries, -> { order(occurred_at: :desc) }, dependent: :destroy

  TERMINAL_STATUSES = %w[accepted rejected ghosted withdrawn].freeze

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

  def create_initial_timeline_entry
    return if wishlist?

    timestamp = (applied? && date_applied.present?) ? date_applied.beginning_of_day : created_at

    timeline_entries.create!(
      entry_type: "status_change",
      description: "Job created as #{status}",
      occurred_at: timestamp,
      metadata: { from: nil, to: status }
    )
  end

  def auto_create_timeline_entry
    return unless saved_change_to_status?

    timeline_entries.create!(
      entry_type: "status_change",
      description: "Status changed from #{status_before_last_save} to #{status}",
      occurred_at: updated_at,
      metadata: { from: status_before_last_save , to: status }
    )
  end
end
