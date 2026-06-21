# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notifications::StageStallEvaluator do
  let(:user) { create(:user) }
  subject(:evaluator) { described_class.new(user) }

  describe "#call" do
    context "when the last status change was more than 14 days ago" do
      let!(:stalled_job) { create(:job, :applied, user: user, date_applied: 30.days.ago.to_date) }

      it "creates a stage_stall notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
        notification = Notification.last
        expect(notification.kind).to eq("stage_stall")
        expect(notification.user).to eq(user)
        expect(notification.job).to eq(stalled_job)
      end
    end

    context "when the last status change was within 14 days" do
      let!(:recent_job) do
        # date_applied: today means the timeline entry occurred_at is today
        create(:job, :applied, user: user, date_applied: Date.current)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a wishlist job was created recently" do
      let!(:wishlist_job) { create(:job, :wishlist, user: user) }

      it "does not create a notification (falls back to created_at)" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a wishlist job was created more than 14 days ago" do
      let!(:old_wishlist_job) do
        job = create(:job, :wishlist, user: user)
        job.update_columns(created_at: 15.days.ago)
        job
      end

      it "creates a stage_stall notification using created_at as fallback" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
      end
    end

    context "when a job receives non-status edits after a stale status change" do
      let!(:edited_job) do
        job = create(:job, :applied, user: user, date_applied: 30.days.ago.to_date)
        # Simulate editing notes without a status change — updated_at refreshes
        # but the timeline entry (occurred_at 30 days ago) should still trigger
        job.update_columns(updated_at: Time.current, notes: "new notes")
        job
      end

      it "still creates a notification because the status has not changed" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
      end
    end

    context "when a job has terminal status" do
      let!(:rejected_job) { create(:job, :rejected, user: user) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a job is archived" do
      let!(:archived_job) { create(:job, :archived, user: user) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "deduplication" do
      let!(:stalled_job) { create(:job, :applied, user: user, date_applied: 30.days.ago.to_date) }

      before do
        create(:notification, :stage_stall, user: user, job: stalled_job,
               created_at: 12.hours.ago)
      end

      it "does not create a second notification within 24 hours" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "dedup window expired" do
      let!(:stalled_job) { create(:job, :applied, user: user, date_applied: 30.days.ago.to_date) }

      before do
        create(:notification, :stage_stall, user: user, job: stalled_job,
               created_at: 25.hours.ago)
      end

      it "creates a new notification after 24 hours" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
      end
    end

    context "when the job belongs to another user" do
      let!(:other_job) { create(:job, :applied, user: create(:user)) }

      it "does not create a notification for this user" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when the user has opted out of stalled application alerts" do
      let(:user) { create(:user, notify_stage_stall: false) }
      let!(:stalled_job) { create(:job, :applied, user: user, date_applied: 30.days.ago.to_date) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end
  end
end
