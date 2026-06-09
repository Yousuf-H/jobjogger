# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notifications::StageStallEvaluator do
  let(:user) { create(:user) }
  subject(:evaluator) { described_class.new(user) }

  describe "#call" do
    context "when a job has had no activity for more than 14 days" do
      let!(:stalled_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 15.days.ago)
        job
      end

      it "creates a stage_stall notification" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
        notification = Notification.last
        expect(notification.kind).to eq("stage_stall")
        expect(notification.user).to eq(user)
        expect(notification.job).to eq(stalled_job)
      end
    end

    context "when a job was updated within the last 14 days" do
      let!(:recent_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 10.days.ago)
        job
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a job has terminal status" do
      let!(:rejected_job) do
        job = create(:job, :rejected, user: user)
        job.update_columns(updated_at: 20.days.ago)
        job
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "when a job is archived" do
      let!(:archived_job) do
        job = create(:job, :archived, user: user)
        job.update_columns(updated_at: 20.days.ago)
        job
      end

      it "does not create a notification" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "deduplication" do
      let!(:stalled_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 15.days.ago)
        job
      end

      before do
        create(:notification, :stage_stall, user: user, job: stalled_job,
               created_at: 12.hours.ago)
      end

      it "does not create a second notification within 24 hours" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end

    context "dedup window expired" do
      let!(:stalled_job) do
        job = create(:job, :applied, user: user)
        job.update_columns(updated_at: 15.days.ago)
        job
      end

      before do
        create(:notification, :stage_stall, user: user, job: stalled_job,
               created_at: 25.hours.ago)
      end

      it "creates a new notification after 24 hours" do
        expect { evaluator.call }.to change { Notification.count }.by(1)
      end
    end

    context "when the job belongs to another user" do
      let!(:other_job) do
        job = create(:job, :applied, user: create(:user))
        job.update_columns(updated_at: 20.days.ago)
        job
      end

      it "does not create a notification for this user" do
        expect { evaluator.call }.not_to change { Notification.count }
      end
    end
  end
end
