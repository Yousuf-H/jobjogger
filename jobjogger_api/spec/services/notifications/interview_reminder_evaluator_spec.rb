# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notifications::InterviewReminderEvaluator do
  let(:user) { create(:user) }
  let(:job)  { create(:job, :applied, user: user) }
  subject(:evaluator) { described_class.new(user) }

  describe "#call" do
    context "when an interview is within 24 hours" do
      let!(:upcoming_interview) do
        create(:interview, job: job, scheduled_at: 6.hours.from_now)
      end

      it "creates an interview_reminder notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
        notification = Notification.last
        expect(notification.kind).to eq("interview_reminder")
        expect(notification.user).to eq(user)
        expect(notification.job).to eq(job)
        expect(notification.body).to include(job.job_title)
        expect(notification.body).to include(job.company_name)
      end
    end

    context "when an interview is more than 24 hours away" do
      let!(:distant_interview) do
        create(:interview, job: job, scheduled_at: 36.hours.from_now)
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when an interview is in the past" do
      let!(:past_interview) { create(:interview, :past, job: job) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when the job is archived" do
      let(:archived_job) { create(:job, :applied, :archived, user: user) }
      let!(:interview) { create(:interview, job: archived_job, scheduled_at: 6.hours.from_now) }

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when the interview belongs to another user's job" do
      let!(:other_interview) do
        create(:interview, job: create(:job, user: create(:user)), scheduled_at: 6.hours.from_now)
      end

      it "does not create a notification for this user" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "deduplication" do
      let!(:upcoming_interview) do
        create(:interview, job: job, scheduled_at: 6.hours.from_now)
      end

      before do
        create(:notification, :interview_reminder, user: user, job: job,
               created_at: 4.hours.ago)
      end

      it "does not create a duplicate within 24 hours" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when two interviews for the same job are within 24 hours" do
      let!(:interview_1) { create(:interview, job: job, scheduled_at: 4.hours.from_now) }
      let!(:interview_2) { create(:interview, :technical, job: job, scheduled_at: 8.hours.from_now) }

      it "creates only one notification per job" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
      end
    end
  end
end
