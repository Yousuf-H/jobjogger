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

# ── Helper to create a job and walk it through statuses with timeline entries ──

def create_job_with_history(user:, attrs:, status_progression:, days_between: 3)
  # Create at wishlist first
  job = Job.create!(
    user: user,
    status: "wishlist",
    **attrs.except(:created_offset),
    created_at: attrs[:created_offset] ? attrs[:created_offset].days.ago : rand(1..60).days.ago
  )

  # Walk through each status transition with realistic timing
  current_time = job.created_at
  status_progression.each do |target_status|
    current_time += rand(1..days_between).days
    job.update!(status: target_status, updated_at: current_time)
  end

  job
end

# ── Wishlist jobs (no progress yet) ─────────────────────────────────────────────

Job.create!(
  user: demo_user,
  company_name: "Canva",
  job_title: "Frontend Developer",
  status: "wishlist",
  location: "Sydney, NSW",
  employment_type: "full_time",
  source: "linkedin",
  priority: "high",
  salary_range: "$120k - $150k",
  job_url: "https://www.canva.com/careers",
  tags: ["react", "typescript", "design-tools"],
  notes: "Great culture, remote-friendly. Heard good things from ex-colleagues.",
  created_at: 5.days.ago
)

Job.create!(
  user: demo_user,
  company_name: "Atlassian",
  job_title: "Full Stack Engineer",
  status: "wishlist",
  location: "Sydney, NSW",
  employment_type: "full_time",
  source: "company_site",
  priority: "high",
  salary_range: "$130k - $160k",
  job_url: "https://www.atlassian.com/company/careers",
  tags: ["react", "java", "cloud"],
  notes: "Team Atlas - working on Jira Cloud. Need to tailor resume for Java experience.",
  follow_up_date: 2.days.from_now,
  created_at: 3.days.ago
)

Job.create!(
  user: demo_user,
  company_name: "Xero",
  job_title: "Software Engineer",
  status: "wishlist",
  location: "Melbourne, VIC",
  employment_type: "full_time",
  source: "seek",
  priority: "medium",
  salary_range: "$110k - $130k",
  job_url: "https://www.xero.com/careers",
  tags: ["ruby", "rails", "fintech"],
  created_at: 2.days.ago
)

# ── Applied jobs ────────────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "REA Group",
    job_title: "Ruby Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "seek",
    priority: "high",
    salary_range: "$120k - $140k",
    job_url: "https://www.rea-group.com/careers",
    tags: ["ruby", "rails", "real-estate"],
    notes: "Applied via Seek. Role is in the listings team.",
    follow_up_date: 3.days.from_now,
    created_offset: 14
  },
  status_progression: ["applied"]
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Culture Amp",
    job_title: "Frontend Engineer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "linkedin",
    priority: "medium",
    salary_range: "$115k - $135k",
    job_url: "https://www.cultureamp.com/careers",
    tags: ["react", "typescript", "hr-tech"],
    notes: "Connected with a recruiter on LinkedIn. Waiting to hear back.",
    created_offset: 20
  },
  status_progression: ["applied"]
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Buildkite",
    job_title: "Full Stack Developer",
    location: "Melbourne, VIC (Remote)",
    employment_type: "full_time",
    source: "referral",
    priority: "high",
    salary_range: "$130k - $155k",
    job_url: "https://buildkite.com/careers",
    tags: ["ruby", "react", "ci-cd", "devtools"],
    notes: "Referred by a friend who works there. Strong Ruby shop.",
    follow_up_date: 1.day.from_now,
    created_offset: 12
  },
  status_progression: ["applied"]
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Envato",
    job_title: "Junior Rails Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "company_site",
    priority: "medium",
    salary_range: "$90k - $110k",
    job_url: "https://www.envato.com/careers",
    tags: ["ruby", "rails", "marketplace"],
    created_offset: 25
  },
  status_progression: ["applied"]
)

# ── Phone screen jobs ──────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Zendesk",
    job_title: "Software Engineer II",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "linkedin",
    priority: "high",
    salary_range: "$125k - $145k",
    job_url: "https://www.zendesk.com/jobs",
    tags: ["ruby", "rails", "saas", "customer-support"],
    notes: "Phone screen went well. Recruiter mentioned next step is a take-home.",
    created_offset: 30
  },
  status_progression: ["applied", "phone_screen"]
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Up Banking",
    job_title: "Backend Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "referral",
    priority: "medium",
    salary_range: "$110k - $130k",
    job_url: "https://up.com.au/careers",
    tags: ["ruby", "fintech", "banking"],
    notes: "Phone screen with engineering manager. They use Ruby heavily.",
    created_offset: 28
  },
  status_progression: ["applied", "phone_screen"]
)

# ── Interviewing jobs ──────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Seek",
    job_title: "Full Stack Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "seek",
    priority: "high",
    salary_range: "$120k - $150k",
    job_url: "https://www.seek.com.au/about/careers",
    tags: ["react", "typescript", "ruby", "rails"],
    notes: "Technical interview scheduled. Pair programming exercise on a Rails app.",
    created_offset: 35
  },
  status_progression: ["applied", "phone_screen", "interviewing"],
  days_between: 5
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "SafetyCulture",
    job_title: "Software Engineer",
    location: "Sydney, NSW (Remote OK)",
    employment_type: "full_time",
    source: "linkedin",
    priority: "medium",
    salary_range: "$115k - $140k",
    job_url: "https://safetyculture.com/careers",
    tags: ["golang", "react", "saas"],
    notes: "2nd round interview. Team seems great. Tech stack is Go + React.",
    created_offset: 40
  },
  status_progression: ["applied", "phone_screen", "interviewing"],
  days_between: 4
)

# ── Offer jobs ─────────────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Carsales",
    job_title: "Ruby Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "seek",
    priority: "high",
    salary_range: "$125k - $145k",
    job_url: "https://www.carsales.com.au/careers",
    tags: ["ruby", "rails", "automotive"],
    notes: "Received offer! $135k + super. Need to decide by end of week.",
    next_action: "Review offer and negotiate",
    created_offset: 45
  },
  status_progression: ["applied", "phone_screen", "interviewing", "offer"],
  days_between: 5
)

# ── Accepted job ───────────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Redbubble",
    job_title: "Junior Full Stack Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "referral",
    priority: "high",
    salary_range: "$95k - $110k",
    job_url: "https://www.redbubble.com/careers",
    tags: ["ruby", "rails", "react", "e-commerce"],
    notes: "Accepted the offer! Start date in 3 weeks.",
    created_offset: 55
  },
  status_progression: ["applied", "phone_screen", "interviewing", "offer", "accepted"],
  days_between: 5
)

# ── Rejected jobs ──────────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Afterpay",
    job_title: "Software Engineer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "linkedin",
    priority: "medium",
    salary_range: "$130k - $160k",
    job_url: "https://www.afterpay.com/careers",
    tags: ["fintech", "payments", "java"],
    notes: "Rejected after technical interview. Feedback: need more Java experience.",
    created_offset: 40
  },
  status_progression: ["applied", "phone_screen", "interviewing", "rejected"],
  days_between: 5
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Sportsbet",
    job_title: "Backend Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "seek",
    priority: "low",
    salary_range: "$100k - $120k",
    job_url: "https://www.sportsbet.com.au/careers",
    tags: ["ruby", "betting", "backend"],
    notes: "Rejected at application stage. Position filled internally.",
    created_offset: 30
  },
  status_progression: ["applied", "rejected"],
  days_between: 7
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Airtasker",
    job_title: "Full Stack Engineer",
    location: "Sydney, NSW",
    employment_type: "full_time",
    source: "company_site",
    priority: "low",
    salary_range: "$105k - $125k",
    job_url: "https://www.airtasker.com/careers",
    tags: ["ruby", "rails", "marketplace"],
    created_offset: 35
  },
  status_progression: ["applied", "rejected"],
  days_between: 10
)

# ── Ghosted jobs ───────────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Myob",
    job_title: "Software Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "seek",
    priority: "medium",
    salary_range: "$100k - $120k",
    job_url: "https://www.myob.com/careers",
    tags: ["accounting", "saas", "dotnet"],
    notes: "No response after 3 follow-ups. Moving on.",
    created_offset: 45
  },
  status_progression: ["applied", "ghosted"],
  days_between: 14
)

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Finder",
    job_title: "Frontend Developer",
    location: "Sydney, NSW (Remote)",
    employment_type: "contract",
    source: "linkedin",
    priority: "low",
    salary_range: "$600/day",
    job_url: "https://www.finder.com.au/careers",
    tags: ["react", "next-js", "comparison"],
    notes: "Applied 6 weeks ago, no response at all.",
    created_offset: 42
  },
  status_progression: ["applied", "ghosted"],
  days_between: 21
)

# ── Withdrawn job ──────────────────────────────────────────────────────────────

create_job_with_history(
  user: demo_user,
  attrs: {
    company_name: "Telstra",
    job_title: "Graduate Developer",
    location: "Melbourne, VIC",
    employment_type: "full_time",
    source: "company_site",
    priority: "low",
    salary_range: "$75k - $85k",
    job_url: "https://www.telstra.com.au/careers",
    tags: ["graduate", "telco"],
    notes: "Withdrew after receiving better offer from Redbubble.",
    created_offset: 50
  },
  status_progression: ["applied", "phone_screen", "withdrawn"],
  days_between: 7
)

# ── Archived job ───────────────────────────────────────────────────────────────

archived_job = Job.create!(
  user: demo_user,
  company_name: "Hipages",
  job_title: "Rails Developer",
  status: "wishlist",
  location: "Sydney, NSW",
  employment_type: "full_time",
  source: "seek",
  priority: "low",
  salary_range: "$95k - $115k",
  job_url: "https://www.hipages.com.au/careers",
  tags: ["ruby", "rails", "trades"],
  notes: "Listing removed. Archiving.",
  created_at: 50.days.ago
)
archived_job.update!(status: "applied")
archived_job.archive!

# ── Add some manual timeline entries for richer data ────────────────────────────

seek_job = Job.find_by(company_name: "Seek")
if seek_job
  TimelineEntry.create!(
    job: seek_job,
    entry_type: "note",
    description: "Researched the team on LinkedIn. Found 3 mutual connections.",
    occurred_at: 30.days.ago
  )
  TimelineEntry.create!(
    job: seek_job,
    entry_type: "contact",
    description: "Spoke with Sarah (recruiter) about the role and team structure.",
    occurred_at: 25.days.ago,
    metadata: { contact_name: "Sarah Chen", contact_role: "Recruiter" }
  )
  TimelineEntry.create!(
    job: seek_job,
    entry_type: "interview",
    description: "Technical pair programming session. Built a small Rails feature together.",
    occurred_at: 15.days.ago,
    metadata: { interviewer: "Tom Nguyen", format: "video", duration: "90 mins" }
  )
end

carsales_job = Job.find_by(company_name: "Carsales")
if carsales_job
  TimelineEntry.create!(
    job: carsales_job,
    entry_type: "interview",
    description: "Final round panel interview with CTO and team lead.",
    occurred_at: 10.days.ago,
    metadata: { interviewer: "Panel", format: "in-person", duration: "60 mins" }
  )
  TimelineEntry.create!(
    job: carsales_job,
    entry_type: "note",
    description: "Received verbal offer! Written offer to follow.",
    occurred_at: 5.days.ago
  )
end

buildkite_job = Job.find_by(company_name: "Buildkite")
if buildkite_job
  TimelineEntry.create!(
    job: buildkite_job,
    entry_type: "follow_up",
    description: "Sent follow-up email to check on application status.",
    occurred_at: 5.days.ago
  )
end

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