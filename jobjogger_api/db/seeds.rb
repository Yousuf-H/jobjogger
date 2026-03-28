# frozen_string_literal: true

# Clean slate
TimelineEntry.destroy_all
Job.destroy_all
User.destroy_all

puts "Cleaned existing data"

demo_user = User.create!(
  email: "demo@jobjogger.com",
  password: "password123",
  password_confirmation: "password123",
  name: "Yousuf Demo"
)

puts "Created demo user: #{demo_user.email}"

# ── Helper ──────────────────────────────────────────────────────────────────────

def create_job_with_history(user:, attrs:, status_progression: [], days_between: 3)
  job = Job.create!(
    user: user,
    status: "wishlist",
    **attrs.except(:created_offset),
    created_at: (attrs[:created_offset] || rand(1..60)).days.ago
  )

  current_time = job.created_at
  status_progression.each do |target_status|
    current_time += rand(1..days_between).days
    job.update!(status: target_status, updated_at: current_time)
  end

  job
end

# ── Job definitions ─────────────────────────────────────────────────────────────

JOBS = [
  # Wishlist
  { attrs: { company_name: "Canva", job_title: "Frontend Developer", location: "Sydney, NSW",
             employment_type: "full_time", source: "linkedin", priority: "high",
             salary_range: "$120k - $150k", job_url: "https://www.canva.com/careers",
             tags: ["react", "typescript", "design-tools"],
             notes: "Great culture, remote-friendly.", created_offset: 5 } },
  { attrs: { company_name: "Atlassian", job_title: "Full Stack Engineer", location: "Sydney, NSW",
             employment_type: "full_time", source: "company_site", priority: "high",
             salary_range: "$130k - $160k", job_url: "https://www.atlassian.com/company/careers",
             tags: ["react", "java", "cloud"], follow_up_date: 2.days.from_now,
             notes: "Team Atlas - working on Jira Cloud.", created_offset: 3 } },
  { attrs: { company_name: "Xero", job_title: "Software Engineer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "seek", priority: "medium",
             salary_range: "$110k - $130k", job_url: "https://www.xero.com/careers",
             tags: ["ruby", "rails", "fintech"], created_offset: 2 } },

  # Applied
  { attrs: { company_name: "REA Group", job_title: "Ruby Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "seek", priority: "high",
             salary_range: "$120k - $140k", job_url: "https://www.rea-group.com/careers",
             tags: ["ruby", "rails", "real-estate"], follow_up_date: 3.days.from_now,
             notes: "Applied via Seek.", created_offset: 14 },
    progression: ["applied"] },
  { attrs: { company_name: "Culture Amp", job_title: "Frontend Engineer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "linkedin", priority: "medium",
             salary_range: "$115k - $135k", job_url: "https://www.cultureamp.com/careers",
             tags: ["react", "typescript", "hr-tech"],
             notes: "Connected with a recruiter on LinkedIn.", created_offset: 20 },
    progression: ["applied"] },
  { attrs: { company_name: "Buildkite", job_title: "Full Stack Developer", location: "Melbourne, VIC (Remote)",
             employment_type: "full_time", source: "referral", priority: "high",
             salary_range: "$130k - $155k", job_url: "https://buildkite.com/careers",
             tags: ["ruby", "react", "ci-cd", "devtools"], follow_up_date: 1.day.from_now,
             notes: "Referred by a friend. Strong Ruby shop.", created_offset: 12 },
    progression: ["applied"] },
  { attrs: { company_name: "Envato", job_title: "Junior Rails Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "company_site", priority: "medium",
             salary_range: "$90k - $110k", job_url: "https://www.envato.com/careers",
             tags: ["ruby", "rails", "marketplace"], created_offset: 25 },
    progression: ["applied"] },

  # Phone screen
  { attrs: { company_name: "Zendesk", job_title: "Software Engineer II", location: "Melbourne, VIC",
             employment_type: "full_time", source: "linkedin", priority: "high",
             salary_range: "$125k - $145k", job_url: "https://www.zendesk.com/jobs",
             tags: ["ruby", "rails", "saas", "customer-support"],
             notes: "Phone screen went well. Take-home next.", created_offset: 30 },
    progression: ["applied", "phone_screen"] },
  { attrs: { company_name: "Up Banking", job_title: "Backend Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "referral", priority: "medium",
             salary_range: "$110k - $130k", job_url: "https://up.com.au/careers",
             tags: ["ruby", "fintech", "banking"],
             notes: "Phone screen with engineering manager.", created_offset: 28 },
    progression: ["applied", "phone_screen"] },

  # Interviewing
  { attrs: { company_name: "Seek", job_title: "Full Stack Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "seek", priority: "high",
             salary_range: "$120k - $150k", job_url: "https://www.seek.com.au/about/careers",
             tags: ["react", "typescript", "ruby", "rails"],
             notes: "Pair programming exercise on a Rails app.", created_offset: 35 },
    progression: ["applied", "phone_screen", "interviewing"], days_between: 5 },
  { attrs: { company_name: "SafetyCulture", job_title: "Software Engineer", location: "Sydney, NSW (Remote OK)",
             employment_type: "full_time", source: "linkedin", priority: "medium",
             salary_range: "$115k - $140k", job_url: "https://safetyculture.com/careers",
             tags: ["golang", "react", "saas"],
             notes: "2nd round interview. Go + React stack.", created_offset: 40 },
    progression: ["applied", "phone_screen", "interviewing"], days_between: 4 },

  # Offer
  { attrs: { company_name: "Carsales", job_title: "Ruby Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "seek", priority: "high",
             salary_range: "$125k - $145k", job_url: "https://www.carsales.com.au/careers",
             tags: ["ruby", "rails", "automotive"],
             notes: "Received offer! $135k + super.", next_action: "Review offer and negotiate",
             created_offset: 45 },
    progression: ["applied", "phone_screen", "interviewing", "offer"], days_between: 5 },

  # Accepted
  { attrs: { company_name: "Redbubble", job_title: "Junior Full Stack Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "referral", priority: "high",
             salary_range: "$95k - $110k", job_url: "https://www.redbubble.com/careers",
             tags: ["ruby", "rails", "react", "e-commerce"],
             notes: "Accepted! Start date in 3 weeks.", created_offset: 55 },
    progression: ["applied", "phone_screen", "interviewing", "offer", "accepted"], days_between: 5 },

  # Rejected
  { attrs: { company_name: "Afterpay", job_title: "Software Engineer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "linkedin", priority: "medium",
             salary_range: "$130k - $160k", job_url: "https://www.afterpay.com/careers",
             tags: ["fintech", "payments", "java"],
             notes: "Rejected after technical. Need more Java.", created_offset: 40 },
    progression: ["applied", "phone_screen", "interviewing", "rejected"], days_between: 5 },
  { attrs: { company_name: "Sportsbet", job_title: "Backend Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "seek", priority: "low",
             salary_range: "$100k - $120k", job_url: "https://www.sportsbet.com.au/careers",
             tags: ["ruby", "betting", "backend"],
             notes: "Position filled internally.", created_offset: 30 },
    progression: ["applied", "rejected"], days_between: 7 },
  { attrs: { company_name: "Airtasker", job_title: "Full Stack Engineer", location: "Sydney, NSW",
             employment_type: "full_time", source: "company_site", priority: "low",
             salary_range: "$105k - $125k", job_url: "https://www.airtasker.com/careers",
             tags: ["ruby", "rails", "marketplace"], created_offset: 35 },
    progression: ["applied", "rejected"], days_between: 10 },

  # Ghosted
  { attrs: { company_name: "Myob", job_title: "Software Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "seek", priority: "medium",
             salary_range: "$100k - $120k", job_url: "https://www.myob.com/careers",
             tags: ["accounting", "saas", "dotnet"],
             notes: "No response after 3 follow-ups.", created_offset: 45 },
    progression: ["applied", "ghosted"], days_between: 14 },
  { attrs: { company_name: "Finder", job_title: "Frontend Developer", location: "Sydney, NSW (Remote)",
             employment_type: "contract", source: "linkedin", priority: "low",
             salary_range: "$600/day", job_url: "https://www.finder.com.au/careers",
             tags: ["react", "next-js", "comparison"],
             notes: "Applied 6 weeks ago, no response.", created_offset: 42 },
    progression: ["applied", "ghosted"], days_between: 21 },

  # Withdrawn
  { attrs: { company_name: "Telstra", job_title: "Graduate Developer", location: "Melbourne, VIC",
             employment_type: "full_time", source: "company_site", priority: "low",
             salary_range: "$75k - $85k", job_url: "https://www.telstra.com.au/careers",
             tags: ["graduate", "telco"],
             notes: "Withdrew after Redbubble offer.", created_offset: 50 },
    progression: ["applied", "phone_screen", "withdrawn"], days_between: 7 }
].freeze

# ── Create all jobs ─────────────────────────────────────────────────────────────

JOBS.each do |job_def|
  create_job_with_history(
    user: demo_user,
    attrs: job_def[:attrs],
    status_progression: job_def[:progression] || [],
    days_between: job_def[:days_between] || 3
  )
end

# ── Archived job (special case — needs archive! after creation) ─────────────────

archived_job = create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Hipages", job_title: "Rails Developer", location: "Sydney, NSW",
    employment_type: "full_time", source: "seek", priority: "low",
    salary_range: "$95k - $115k", job_url: "https://www.hipages.com.au/careers",
    tags: ["ruby", "rails", "trades"], notes: "Listing removed.", created_offset: 50
  },
  status_progression: ["applied"]
)
archived_job.archive!

# ── Manual timeline entries for richer data ─────────────────────────────────────

MANUAL_ENTRIES = [
  { company: "Seek", entries: [
    { entry_type: "note", description: "Researched the team on LinkedIn. Found 3 mutual connections.",
      occurred_at: 30.days.ago },
    { entry_type: "contact", description: "Spoke with Sarah about the role and team structure.",
      occurred_at: 25.days.ago, metadata: { contact_name: "Sarah Chen", contact_role: "Recruiter" } },
    { entry_type: "interview", description: "Technical pair programming. Built a small Rails feature.",
      occurred_at: 15.days.ago, metadata: { interviewer: "Tom Nguyen", format: "video", duration: "90 mins" } }
  ] },
  { company: "Carsales", entries: [
    { entry_type: "interview", description: "Final round panel interview with CTO and team lead.",
      occurred_at: 10.days.ago, metadata: { interviewer: "Panel", format: "in-person", duration: "60 mins" } },
    { entry_type: "note", description: "Received verbal offer! Written offer to follow.",
      occurred_at: 5.days.ago }
  ] },
  { company: "Buildkite", entries: [
    { entry_type: "follow_up", description: "Sent follow-up email to check on application status.",
      occurred_at: 5.days.ago }
  ] }
].freeze

MANUAL_ENTRIES.each do |group|
  job = Job.find_by(company_name: group[:company])
  next unless job

  group[:entries].each { |entry_attrs| TimelineEntry.create!(job: job, **entry_attrs) }
end

# ── Summary ─────────────────────────────────────────────────────────────────────

puts ""
puts "=== Seed Complete ==="
puts "Created #{Job.count} jobs for demo user"
puts "Created #{TimelineEntry.count} timeline entries"
puts ""
puts "Status breakdown:"
Job.group(:status).count.sort_by { |_, v| -v }.each do |status, count|
  puts "  #{status.ljust(15)} #{count}"
end
puts ""
puts "Source breakdown:"
Job.group(:source).count.each do |source, count|
  puts "  #{(source || 'none').ljust(15)} #{count}"
end
puts ""
puts "Signin with: demo@jobjogger.com / password123"