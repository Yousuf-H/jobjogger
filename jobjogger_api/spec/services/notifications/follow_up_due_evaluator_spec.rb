# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notifications::FollowUpDueEvaluator do
  let(:user) { create(:user) }
  subject(:evaluator) { described_class.new(user) }

  describe "#call" do
    context "when an active job has a follow_up_date of today" do
      let!(:due_job) do
        create(:job, :applied, user: user, follow_up_date: Date.current)
      end

      it "creates a follow_up_due notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
        notification = Notification.last
        expect(notification.kind).to eq("follow_up_due")
        expect(notification.job).to eq(due_job)
      end
    end

    context "when an active job has an overdue follow_up_date" do
      let!(:overdue_job) do
        create(:job, :applied, user: user, follow_up_date: 3.days.ago.to_date)
      end

      it "creates a follow_up_due notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
      end
    end

    context "when follow_up_date is in the future" do
      let!(:future_job) do
        create(:job, :applied, user: user, follow_up_date: 3.days.from_now.to_date)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when follow_up_date is nil" do
      let!(:no_followup_job) { create(:job, :applied, user: user, follow_up_date: nil) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a job has terminal status" do
      let!(:terminal_job) do
        create(:job, :ghosted, user: user, follow_up_date: Date.current)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "deduplication" do
      let!(:due_job) do
        create(:job, :applied, user: user, follow_up_date: Date.current)
      end

      before do
        create(:notification, :follow_up_due, user: user, job: due_job,
               created_at: 10.hours.ago)
      end

      it "does not create a duplicate within 24 hours" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end
  end
end
