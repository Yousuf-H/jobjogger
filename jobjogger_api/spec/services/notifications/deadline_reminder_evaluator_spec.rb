# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notifications::DeadlineReminderEvaluator do
  let(:user) { create(:user) }
  subject(:evaluator) { described_class.new(user) }

  describe "#call" do
    context "when a job has a deadline within 48 hours" do
      let!(:urgent_job) do
        create(:job, :applied, user: user, application_deadline: Date.current + 1)
      end

      it "creates a deadline_reminder notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
        notification = Notification.last
        expect(notification.kind).to eq("deadline_reminder")
        expect(notification.job).to eq(urgent_job)
      end
    end

    context "when a job deadline is more than 48 hours away" do
      let!(:distant_job) do
        create(:job, :applied, user: user, application_deadline: Date.current + 5)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when application_deadline is nil" do
      let!(:no_deadline_job) { create(:job, :applied, user: user, application_deadline: nil) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when job status is not wishlist or applied" do
      let!(:interviewing_job) do
        create(:job, :interviewing, user: user, application_deadline: Date.current + 1)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a job is archived" do
      let!(:archived_job) do
        create(:job, :applied, :archived, user: user, application_deadline: Date.current + 1)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "deduplication" do
      let!(:urgent_job) do
        create(:job, :applied, user: user, application_deadline: Date.current + 1)
      end

      before do
        create(:notification, :deadline_reminder, user: user, job: urgent_job,
               created_at: 6.hours.ago)
      end

      it "does not create a duplicate within 24 hours" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end
  end
end
