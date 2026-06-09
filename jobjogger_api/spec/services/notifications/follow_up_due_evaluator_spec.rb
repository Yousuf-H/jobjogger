# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notifications::FollowUpDueEvaluator do
  let(:user) { create(:user) }
  subject(:evaluator) { described_class.new(user) }

  describe "#call" do
    context "when an active job has had no activity for 7+ days" do
      let!(:idle_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 8.days.ago)
        job
      end

      it "creates a follow_up_due notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
        notification = Notification.last
        expect(notification.kind).to eq("follow_up_due")
        expect(notification.job).to eq(idle_job)
      end
    end

    context "when a job was updated within the last 7 days" do
      let!(:active_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 5.days.ago)
        job
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a job has terminal status" do
      let!(:terminal_job) do
        job = create(:job, :ghosted, user: user)
        job.update_columns(updated_at: 10.days.ago)
        job
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "deduplication" do
      let!(:idle_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 8.days.ago)
        job
      end

      before do
        create(:notification, :follow_up_due, user: user, job: idle_job,
               created_at: 10.hours.ago)
      end

      it "does not create a duplicate within 24 hours" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end
  end
end
