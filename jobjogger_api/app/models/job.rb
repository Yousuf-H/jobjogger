class Job < ApplicationRecord
  has_many :timeline_entries, dependent: :destroy

  TERMINAL_STATUSES = %w[accepted rejected ghosted withdrawn].freeze

  # Enum for status
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

  #  Basic Validations
  validates :company_name, presence: true
  validates :job_title, presence: true
  validates :status, presence: true

  # Conditional validation
  validates :job_url, presence: true, unless: :url_optional?
  validates :source_other, presence: true, if: :other_source?

  # Scopes
  scope :active, -> { where(archived_at: nil).where.not(status: TERMINAL_STATUSES) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :overdue, -> { active.where("follow_up_date < ?", Date.current) }
  scope :due_this_week, -> { active.where(follow_up_date: Date.current..Date.current.end_of_week(:sunday)) }

  before_save :normalise_tags
  before_update :set_date_applied_if_needed
  after_update_commit :auto_create_timeline_entry

  def archive!
    update(archived_at: Time.current)
  end

  def unarchive!
    update(archived_at: nil)
  end

  private

  def url_optional?
    wishlist? || archived_at.present?
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

  def auto_create_timeline_entry
    return unless saved_change_to_status?

    self.timeline_entries.create!(
      entry_type: "status_change",
      description: "Status changed from #{status_before_last_save} to #{status}",
      occurred_at: updated_at
    )
  end
end
