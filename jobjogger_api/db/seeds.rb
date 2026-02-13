Job.destroy_all

Job.create!(
  company_name: "Addressfinder",
  job_title: "Junior Software Dev",
  status: "wishlist",
  job_url: "www.addressfinder.co.nz",
  tags: ["software development", "junior"]
)

puts "Job Created!"

# A job that's overdue (follow_up_date in the past)
Job.create!(
  company_name: "Abeltec",
  job_title: "Senior Software Dev",
  status: "wishlist",
  job_url: "www.abeltec.co.nz",
  tags: ["software development", "senior", "Abletech"],
  follow_up_date: 1.week.ago
)

puts "Overdue Job Created!"

# A job due this week (follow_up_date = 2 days from now)
Job.create!(
  company_name: "Amazon",
  job_title: "Data Engineer",
  status: "wishlist",
  job_url: "www.amazon.com",
  tags: ["Data Engineer", "Amazon"],
  follow_up_date: 1.days.from_now
)

puts "Job due this week Created!"

# An applied job (to test date_applied gets set)
job_at_netflix = Job.create!(
  company_name: "Netflix",
  job_title: "Dev Ops",
  status: "wishlist",
  job_url: "www.netflix.com",
  tags: ["Netflix", "Dev Ops"],
)

job_at_netflix.update!(status: "applied")

puts "An applied job Created!"

# A rejected job (to test terminal status)
Job.create!(
  company_name: "Microsoft",
  job_title: "CEO",
  status: "rejected",
  job_url: "www.microsoft.com",
  tags: ["Microsoft", "CEO"],
)

puts "Rejected job Created!"

# A job with timeline entries (manually created)
job_at_google = Job.create!(
  company_name: "Google",
  job_title: "CEO",
  status: "applied",
  job_url: "www.faceboook.com",
  tags: ["Google", "CEO"],
)

TimelineEntry.create!(
  job: job_at_google,
  entry_type: "note",
  description: "I applied for the job finally!",
  occurred_at: Time.current
)

puts "Job with timeline entries Created!"

# An archived job
Job.create!(
  company_name: "NASA",
  job_title: "HR",
  status: "phone_screen",
  job_url: "www.nasa.com",
  tags: ["NASA", "HR"],
  archived_at: Date.current
)