# frozen_string_literal: true

require "rails_helper"

RSpec.describe Job, type: :model do
  # ── Associations ─────────────────────────────────────────────────────────────

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:timeline_entries).dependent(:destroy) }
  end

  # ── Validations ──────────────────────────────────────────────────────────────

  describe "validations" do
    subject { build(:job) }

    it { is_expected.to validate_presence_of(:company_name) }
    it { is_expected.to validate_presence_of(:job_title) }
    it { is_expected.to validate_presence_of(:status) }

    context "job_url" do
      it "is valid when blank" do
        job = build(:job, job_url: nil)
        expect(job).to be_valid
      end

      it "is valid with a full https URL" do
        job = build(:job, job_url: "https://example.com/jobs/123")
        expect(job).to be_valid
      end

      it "is invalid with a non-URI string" do
        job = build(:job, job_url: "not a url at all!!")
        expect(job).not_to be_valid
        expect(job.errors[:job_url]).to be_present
      end
    end

    context "source_other" do
      it "requires source_other when source is 'other'" do
        job = build(:job, source: "other", source_other: nil)
        expect(job).not_to be_valid
        expect(job.errors[:source_other]).to be_present
      end

      it "is valid when source is 'other' and source_other is present" do
        job = build(:job, :from_other)
        expect(job).to be_valid
      end

      it "does not require source_other for non-other sources" do
        job = build(:job, source: "linkedin", source_other: nil)
        expect(job).to be_valid
      end
    end
  end

  # ── Enums ────────────────────────────────────────────────────────────────────

  describe "enums" do
    it "defines the expected status values" do
      expect(Job.statuses.keys).to contain_exactly(
        "wishlist", "applied", "phone_screen", "interviewing",
        "offer", "accepted", "rejected", "ghosted", "withdrawn"
      )
    end

    it "defines the expected priority values" do
      expect(Job.priorities.keys).to contain_exactly("low", "medium", "high")
    end

    it "defines the expected employment_type values" do
      expect(Job.employment_types.keys).to contain_exactly(
        "full_time", "part_time", "casual", "contract"
      )
    end

    it "defines the expected source values" do
      expect(Job.sources.keys).to contain_exactly(
        "seek", "linkedin", "referral", "company_site", "other"
      )
    end
  end

  # ── Scopes ───────────────────────────────────────────────────────────────────

  describe "scopes" do
    let(:user) { create(:user) }

    describe ".active" do
      it "returns jobs that are not archived and not in a terminal status" do
        active_job    = create(:job, :wishlist, user: user)
        terminal_job  = create(:job, :rejected, user: user)
        archived_job  = create(:job, :applied, :archived, user: user)

        results = Job.active
        expect(results).to include(active_job)
        expect(results).not_to include(terminal_job, archived_job)
      end

      it "excludes all terminal statuses" do
        Job::TERMINAL_STATUSES.each do |status|
          create(:job, status: status, user: user)
        end

        expect(Job.active).to be_empty
      end
    end

    describe ".archived" do
      it "returns only jobs with an archived_at timestamp" do
        archived_job  = create(:job, :archived, user: user)
        active_job    = create(:job, :wishlist, user: user)

        expect(Job.archived).to include(archived_job)
        expect(Job.archived).not_to include(active_job)
      end
    end

    describe ".overdue" do
      it "returns jobs whose follow_up_date is in the past" do
        overdue_job = create(:job, :overdue, user: user)
        future_job  = create(:job, follow_up_date: 5.days.from_now.to_date, user: user)

        expect(Job.overdue).to include(overdue_job)
        expect(Job.overdue).not_to include(future_job)
      end
    end

    describe ".due_this_week" do
      it "returns jobs whose follow_up_date falls within the current week" do
        this_week = create(:job, :due_this_week, user: user)
        next_week = create(:job, follow_up_date: 10.days.from_now.to_date, user: user)

        expect(Job.due_this_week).to include(this_week)
        expect(Job.due_this_week).not_to include(next_week)
      end
    end
  end

  # ── Callbacks ────────────────────────────────────────────────────────────────

  describe "URL normalisation" do
    it "prepends https:// when job_url has no scheme" do
      job = create(:job, job_url: "example.com/jobs/42")
      expect(job.job_url).to eq("https://example.com/jobs/42")
    end

    it "does not modify a URL that already has https://" do
      job = create(:job, job_url: "https://example.com/jobs/42")
      expect(job.job_url).to eq("https://example.com/jobs/42")
    end

    it "does not modify a URL that has http://" do
      job = create(:job, job_url: "http://example.com/jobs/42")
      expect(job.job_url).to eq("http://example.com/jobs/42")
    end

    it "leaves blank URLs blank" do
      job = create(:job, job_url: nil)
      expect(job.job_url).to be_nil
    end
  end

  describe "tag normalisation" do
    it "lowercases all tags" do
      job = create(:job, tags: ["Ruby", "RAILS"])
      expect(job.tags).to eq(["ruby", "rails"])
    end

    it "strips leading and trailing whitespace from tags" do
      job = create(:job, tags: ["  rails  "])
      expect(job.tags).to eq(["rails"])
    end

    it "replaces internal spaces with hyphens" do
      job = create(:job, tags: ["remote work"])
      expect(job.tags).to eq(["remote-work"])
    end

    it "removes duplicate tags" do
      job = create(:job, tags: ["ruby", "Ruby", "RUBY"])
      expect(job.tags).to eq(["ruby"])
    end

    it "removes empty tag strings" do
      job = create(:job, tags: ["", "  ", "rails"])
      expect(job.tags).to eq(["rails"])
    end
  end

  describe "date_applied auto-set" do
    it "sets date_applied to today when status changes to applied and date_applied is blank" do
      job = create(:job, :wishlist, date_applied: nil)
      job.update!(status: "applied")
      expect(job.date_applied).to eq(Date.current)
    end

    it "does not overwrite an existing date_applied" do
      existing_date = 5.days.ago.to_date
      job = create(:job, :wishlist, date_applied: existing_date)
      job.update!(status: "applied")
      expect(job.date_applied).to eq(existing_date)
    end

    it "does not set date_applied for non-applied status changes" do
      job = create(:job, :wishlist, date_applied: nil)
      job.update!(status: "phone_screen")
      expect(job.date_applied).to be_nil
    end
  end

  describe "auto timeline entry on status change" do
    it "creates a status_change timeline entry after a status update" do
      job = create(:job, :wishlist)
      expect { job.update!(status: "applied") }
        .to change { job.timeline_entries.status_change.count }.by(1)
    end

    it "records the old and new status in the description" do
      job = create(:job, :wishlist)
      job.update!(status: "applied")
      entry = job.timeline_entries.status_change.last
      expect(entry.description).to match(/wishlist.*applied/i)
    end

    it "does not create a timeline entry when status is unchanged" do
      job = create(:job, :wishlist)
      expect { job.update!(notes: "just updating notes") }
        .not_to change { job.timeline_entries.count }
    end
  end

  # ── Instance methods ──────────────────────────────────────────────────────────

  describe "#archive!" do
    it "sets archived_at to the current time" do
      job = create(:job)
      expect { job.archive! }.to change { job.archived_at }.from(nil)
      expect(job.archived_at).to be_within(2.seconds).of(Time.current)
    end
  end

  describe "#unarchive!" do
    it "clears archived_at" do
      job = create(:job, :archived)
      expect { job.unarchive! }.to change { job.archived_at }.to(nil)
    end
  end

  # ── Constants ─────────────────────────────────────────────────────────────────

  describe "TERMINAL_STATUSES" do
    it "includes accepted, rejected, ghosted, and withdrawn" do
      expect(Job::TERMINAL_STATUSES).to contain_exactly("accepted", "rejected", "ghosted", "withdrawn")
    end
  end
end
