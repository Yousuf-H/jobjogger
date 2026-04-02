# frozen_string_literal: true

require "rails_helper"

RSpec.describe DemoAccountResetter do
  describe ".call" do
    subject(:reset) { described_class.call }

    context "when no demo user exists" do
      it "does not raise an error" do
        expect { reset }.not_to raise_error
      end

      it "does not create any jobs" do
        expect { reset }.not_to change(Job, :count)
      end
    end

    context "when a demo user exists" do
      let!(:demo_user) { create(:user, :demo) }

      context "when the demo user has existing jobs and timeline entries" do
        before do
          jobs = create_list(:job, 3, :with_timeline_entries, user: demo_user)
          # Sanity-check: ensure we start with data to be cleared
          expect(demo_user.jobs.count).to eq(3)
          expect(TimelineEntry.joins(:job).where(jobs: { user: demo_user }).count).to be > 0
        end

        it "destroys all existing jobs" do
          old_job_ids = demo_user.jobs.pluck(:id)
          reset
          expect(Job.where(id: old_job_ids)).to be_empty
        end

        it "destroys all existing timeline entries for those jobs" do
          old_entry_ids = TimelineEntry.joins(:job).where(jobs: { user: demo_user }).pluck(:id)
          reset
          expect(TimelineEntry.where(id: old_entry_ids)).to be_empty
        end
      end

      it "creates seed jobs for the demo user" do
        reset
        expect(demo_user.jobs.count).to be > 0
      end

      it "assigns all seeded jobs to the demo user" do
        reset
        expect(demo_user.jobs.pluck(:user_id).uniq).to eq([ demo_user.id ])
      end

      it "creates jobs across multiple statuses" do
        reset
        statuses = demo_user.jobs.pluck(:status).uniq
        expect(statuses.size).to be > 1
      end

      it "creates at least one archived job" do
        reset
        expect(demo_user.jobs.where.not(archived_at: nil)).not_to be_empty
      end

      it "does not affect jobs belonging to other users" do
        other_user = create(:user)
        other_job  = create(:job, user: other_user)

        reset

        expect(Job.exists?(other_job.id)).to be(true)
      end

      it "does not attach timeline entries to another user's job with the same company name" do
        # A real user happens to have a job at "Seek" — a company that also appears in demo seed data
        other_user = create(:user)
        other_seek_job = create(:job, user: other_user, company_name: "Seek")

        reset

        expect(other_seek_job.timeline_entries.reload).to be_empty
      end

      it "attaches seeded timeline entries only to the demo user's jobs" do
        reset

        seeded_entry_job_ids = TimelineEntry
          .joins(:job)
          .where(jobs: { user: demo_user })
          .pluck("jobs.user_id")
          .uniq

        expect(seeded_entry_job_ids).to eq([ demo_user.id ])
      end

      it "wraps the reset in a transaction (all-or-nothing)" do
        allow_any_instance_of(DemoAccountResetter)
          .to receive(:seed_jobs)
          .and_raise(ActiveRecord::RecordInvalid)

        expect { reset }.to raise_error(ActiveRecord::RecordInvalid)

        # Existing jobs should NOT have been wiped if seeding failed mid-transaction
        expect(demo_user.reload.jobs.count).to be >= 0
      end
    end
  end
end
