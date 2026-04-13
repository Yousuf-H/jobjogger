# frozen_string_literal: true

namespace :organisations do
  desc "Backfill organisations for all existing jobs that have a company_name but no organisation_id"
  task backfill: :environment do
    jobs = Job.where(organisation_id: nil)
    total = jobs.count

    puts "Found #{total} jobs to backfill..."

    success = 0
    failed = 0

    jobs.find_each do |job|
      organisation = Organisations::FindOrCreate.new(
        user: job.user,
        company_name: job.company_name
      ).call

      if organisation && job.update_columns(organisation_id: organisation.id)
        success += 1
      else
        failed += 1
        puts "  Failed: Job ##{job.id} — #{job.company_name}"
      end
    rescue => e
      failed += 1
      puts "  Error: Job ##{job.id} — #{e.message}"
    end

    puts "Done. #{success} linked, #{failed} failed."
  end
end
