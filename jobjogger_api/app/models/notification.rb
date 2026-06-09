# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :job, optional: true

  enum :kind, {
    stage_stall:        0,
    deadline_reminder:  1,
    follow_up_due:      2,
    interview_reminder: 3
  }

  validates :body, presence: true
  validates :kind, presence: true

  scope :unread,  -> { where(read_at: nil) }
  scope :recent,  -> { order(created_at: :desc) }

  def mark_read!
    update!(read_at: Time.current)
  end

  def self.unread_count_for(user)
    where(user: user, read_at: nil).count
  end
end
