# frozen_string_literal: true

class DemoAccountResetter
  def self.call
    new.call
  end

  def call
    demo_user = User.find_by(demo: true)

    if demo_user.nil?
      return
    end

    reset!(demo_user)
  end

  private

  def reset!(demo_user)
    ActiveRecord::Base.transaction do
      TimelineEntry.joins(:job).where(jobs: { user: demo_user }).destroy_all
      demo_user.jobs.destroy_all
      demo_user.organisations.destroy_all
      demo_user.contacts.destroy_all

      orgs_by_name = seed_organisations(demo_user)
      jobs_by_company = seed_jobs(demo_user, orgs_by_name)
      seed_timeline_entries(jobs_by_company)
      seed_contacts(demo_user, orgs_by_name, jobs_by_company)
    end
  end

  def seed_organisations(demo_user)
    orgs_by_name = {}

    organisations.each do |attrs|
      org = demo_user.organisations.create!(attrs.merge(needs_review: false))
      orgs_by_name[org.name] = org
    end

    orgs_by_name
  end

  def seed_jobs(demo_user, orgs_by_name = {})
    jobs_by_company = {}

    jobs.each do |job_def|
      job = create_job_with_history(
        user: demo_user,
        attrs: job_def[:attrs],
        status_progression: job_def[:progression] || [],
        days_between: job_def[:days_between] || 3,
        organisation: orgs_by_name[job_def[:attrs][:company_name]]
      )
      jobs_by_company[job.company_name] = job
    end

    archived_job = create_job_with_history(
      user: demo_user,
      attrs: {
        company_name: "Hipages", job_title: "Rails Developer", location: "Sydney, NSW",
        employment_type: "full_time", source: "seek", priority: "low",
        salary_range: "$95k - $115k", job_url: "https://www.hipages.com.au/careers",
        tags: [ "ruby", "rails", "trades" ], notes: "Listing removed.", created_offset: 50
      },
      status_progression: [ "applied" ],
      organisation: orgs_by_name["Hipages"]
    )
    archived_job.archive!
    jobs_by_company[archived_job.company_name] = archived_job

    jobs_by_company
  end

  def seed_timeline_entries(jobs_by_company)
    manual_entries.each do |group|
      job = jobs_by_company[group[:company]]
      next unless job

      group[:entries].each { |entry_attrs| TimelineEntry.create!(job: job, **entry_attrs) }
    end
  end

  def create_job_with_history(user:, attrs:, status_progression: [], days_between: 3, organisation: nil)
    job = Job.create!(
      user: user,
      status: "wishlist",
      organisation: organisation,
      **attrs.except(:created_offset),
      created_at: (attrs[:created_offset] || rand(1..60)).days.ago
    )

    current_time = job.created_at
    previous_status = "wishlist"

    status_progression.each do |target_status|
      current_time += rand(1..days_between).days

      job.update_columns(status: target_status, updated_at: current_time)

      TimelineEntry.create!(
        job: job,
        entry_type: "status_change",
        description: "Status changed from #{previous_status.humanize} to #{target_status.humanize}",
        occurred_at: current_time,
        metadata: { from: previous_status, to: target_status }
      )

      previous_status = target_status
    end

    job
  end

  def jobs
    [
      # Wishlist
      { attrs: { company_name: "Canva", job_title: "Frontend Developer", location: "Sydney, NSW",
                 employment_type: "full_time", source: "linkedin", priority: "high",
                 salary_range: "$120k - $150k", job_url: "https://www.canva.com/careers",
                 tags: [ "react", "typescript", "design-tools" ],
                 notes: "Great culture, remote-friendly.", created_offset: 5 } },
      { attrs: { company_name: "Atlassian", job_title: "Full Stack Engineer", location: "Sydney, NSW",
                 employment_type: "full_time", source: "company_site", priority: "high",
                 salary_range: "$130k - $160k", job_url: "https://www.atlassian.com/company/careers",
                 tags: [ "react", "java", "cloud" ], follow_up_date: 2.days.from_now,
                 notes: "Team Atlas - working on Jira Cloud.", created_offset: 3 } },
      { attrs: { company_name: "Xero", job_title: "Software Engineer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "seek", priority: "medium",
                 salary_range: "$110k - $130k", job_url: "https://www.xero.com/careers",
                 tags: [ "ruby", "rails", "fintech" ], created_offset: 2 } },

      # Applied
      { attrs: { company_name: "REA Group", job_title: "Ruby Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "seek", priority: "high",
                 salary_range: "$120k - $140k", job_url: "https://www.rea-group.com/careers",
                 tags: [ "ruby", "rails", "real-estate" ], follow_up_date: 3.days.from_now,
                 notes: "Applied via Seek.", created_offset: 14 },
        progression: [ "applied" ] },
      { attrs: { company_name: "Culture Amp", job_title: "Frontend Engineer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "linkedin", priority: "medium",
                 salary_range: "$115k - $135k", job_url: "https://www.cultureamp.com/careers",
                 tags: [ "react", "typescript", "hr-tech" ],
                 notes: "Connected with a recruiter on LinkedIn.", created_offset: 20 },
        progression: [ "applied" ] },
      { attrs: { company_name: "Buildkite", job_title: "Full Stack Developer", location: "Melbourne, VIC (Remote)",
                 employment_type: "full_time", source: "referral", priority: "high",
                 salary_range: "$130k - $155k", job_url: "https://buildkite.com/careers",
                 tags: [ "ruby", "react", "ci-cd", "devtools" ], follow_up_date: 1.day.from_now,
                 notes: "Referred by a friend. Strong Ruby shop.", created_offset: 12 },
        progression: [ "applied" ] },
      { attrs: { company_name: "Envato", job_title: "Junior Rails Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "company_site", priority: "medium",
                 salary_range: "$90k - $110k", job_url: "https://www.envato.com/careers",
                 tags: [ "ruby", "rails", "marketplace" ], created_offset: 25 },
        progression: [ "applied" ] },

      # Phone screen
      { attrs: { company_name: "Zendesk", job_title: "Software Engineer II", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "linkedin", priority: "high",
                 salary_range: "$125k - $145k", job_url: "https://www.zendesk.com/jobs",
                 tags: [ "ruby", "rails", "saas", "customer-support" ],
                 notes: "Phone screen went well. Take-home next.", created_offset: 30 },
        progression: [ "applied", "phone_screen" ] },
      { attrs: { company_name: "Up Banking", job_title: "Backend Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "referral", priority: "medium",
                 salary_range: "$110k - $130k", job_url: "https://up.com.au/careers",
                 tags: [ "ruby", "fintech", "banking" ],
                 notes: "Phone screen with engineering manager.", created_offset: 28 },
        progression: [ "applied", "phone_screen" ] },

      # Interviewing
      { attrs: { company_name: "Seek", job_title: "Full Stack Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "seek", priority: "high",
                 salary_range: "$120k - $150k", job_url: "https://www.seek.com.au/about/careers",
                 tags: [ "react", "typescript", "ruby", "rails" ],
                 notes: "Pair programming exercise on a Rails app.", created_offset: 35 },
        progression: [ "applied", "phone_screen", "interviewing" ], days_between: 5 },
      { attrs: { company_name: "SafetyCulture", job_title: "Software Engineer", location: "Sydney, NSW (Remote OK)",
                 employment_type: "full_time", source: "linkedin", priority: "medium",
                 salary_range: "$115k - $140k", job_url: "https://safetyculture.com/careers",
                 tags: [ "golang", "react", "saas" ],
                 notes: "2nd round interview. Go + React stack.", created_offset: 40 },
        progression: [ "applied", "phone_screen", "interviewing" ], days_between: 4 },

      # Offer
      { attrs: { company_name: "Carsales", job_title: "Ruby Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "seek", priority: "high",
                 salary_range: "$125k - $145k", job_url: "https://www.carsales.com.au/careers",
                 tags: [ "ruby", "rails", "automotive" ],
                 notes: "Received offer! $135k + super.", next_action: "Review offer and negotiate",
                 created_offset: 45 },
        progression: [ "applied", "phone_screen", "interviewing", "offer" ], days_between: 5 },

      # Accepted
      { attrs: { company_name: "Redbubble", job_title: "Junior Full Stack Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "referral", priority: "high",
                 salary_range: "$95k - $110k", job_url: "https://www.redbubble.com/careers",
                 tags: [ "ruby", "rails", "react", "e-commerce" ],
                 notes: "Accepted! Start date in 3 weeks.", created_offset: 55 },
        progression: [ "applied", "phone_screen", "interviewing", "offer", "accepted" ], days_between: 5 },

      # Rejected
      { attrs: { company_name: "Afterpay", job_title: "Software Engineer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "linkedin", priority: "medium",
                 salary_range: "$130k - $160k", job_url: "https://www.afterpay.com/careers",
                 tags: [ "fintech", "payments", "java" ],
                 notes: "Rejected after technical. Need more Java.", created_offset: 40 },
        progression: [ "applied", "phone_screen", "interviewing", "rejected" ], days_between: 5 },
      { attrs: { company_name: "Sportsbet", job_title: "Backend Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "seek", priority: "low",
                 salary_range: "$100k - $120k", job_url: "https://www.sportsbet.com.au/careers",
                 tags: [ "ruby", "betting", "backend" ],
                 notes: "Position filled internally.", created_offset: 30 },
        progression: [ "applied", "rejected" ], days_between: 7 },
      { attrs: { company_name: "Airtasker", job_title: "Full Stack Engineer", location: "Sydney, NSW",
                 employment_type: "full_time", source: "company_site", priority: "low",
                 salary_range: "$105k - $125k", job_url: "https://www.airtasker.com/careers",
                 tags: [ "ruby", "rails", "marketplace" ], created_offset: 35 },
        progression: [ "applied", "rejected" ], days_between: 10 },

      # Ghosted
      { attrs: { company_name: "Myob", job_title: "Software Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "seek", priority: "medium",
                 salary_range: "$100k - $120k", job_url: "https://www.myob.com/careers",
                 tags: [ "accounting", "saas", "dotnet" ],
                 notes: "No response after 3 follow-ups.", created_offset: 45 },
        progression: [ "applied", "ghosted" ], days_between: 14 },
      { attrs: { company_name: "Finder", job_title: "Frontend Developer", location: "Sydney, NSW (Remote)",
                 employment_type: "contract", source: "linkedin", priority: "low",
                 salary_range: "$600/day", job_url: "https://www.finder.com.au/careers",
                 tags: [ "react", "next-js", "comparison" ],
                 notes: "Applied 6 weeks ago, no response.", created_offset: 42 },
        progression: [ "applied", "ghosted" ], days_between: 21 },

      # Withdrawn
      { attrs: { company_name: "Telstra", job_title: "Graduate Developer", location: "Melbourne, VIC",
                 employment_type: "full_time", source: "company_site", priority: "low",
                 salary_range: "$75k - $85k", job_url: "https://www.telstra.com.au/careers",
                 tags: [ "graduate", "telco" ],
                 notes: "Withdrew after Redbubble offer.", created_offset: 50 },
        progression: [ "applied", "phone_screen", "withdrawn" ], days_between: 7 }
    ]
  end

  def organisations
    [
      { name: "Canva", industry: "Design & Creative Tools", size: "1000+",
        website: "canva.com", rating: 4.8,
        notes: "One of Australia's most valuable startups. Strong design culture, remote-friendly. Known for great engineering perks and challenging problems at scale." },
      { name: "Atlassian", industry: "Developer Tools & Collaboration", size: "1000+",
        website: "atlassian.com", rating: 4.5,
        notes: "Remote-first since long before it was trendy. Strong TEAM values. Interview process is thorough — system design + values alignment." },
      { name: "Xero", industry: "FinTech / Accounting SaaS", size: "1000+",
        website: "xero.com", rating: 4.2,
        notes: "Good work-life balance reputation. Large engineering org in Melbourne. Ruby and .NET stack." },
      { name: "REA Group", industry: "PropTech / Real Estate", size: "1000+",
        website: "rea-group.com", rating: 4.3,
        notes: "Strong Ruby on Rails culture. Well known for engineering quality. Used to run a popular Ruby conf. Competitive pay." },
      { name: "Culture Amp", industry: "HR Tech / People Analytics", size: "201-1000",
        website: "cultureamp.com", rating: 4.4,
        notes: "Mission-driven company focused on employee experience. React + Ruby stack. Good Glassdoor reviews for engineering." },
      { name: "Buildkite", industry: "Developer Tools / CI-CD", size: "51-200",
        website: "buildkite.com", rating: 4.7,
        notes: "Fully remote, async-first culture. Strong Ruby and Go stack. Very engineering-led. Referral led to a warm intro — promising." },
      { name: "Envato", industry: "Digital Marketplace", size: "201-1000",
        website: "envato.com", rating: 3.8,
        notes: "Established Melbourne company. Ruby on Rails core. Heard mixed reviews about pace of growth but solid team culture." },
      { name: "Zendesk", industry: "Customer Service SaaS", size: "1000+",
        website: "zendesk.com", rating: 4.1,
        notes: "Large engineering org. Phone screen went well. Take-home coding exercise is next. Ruby + React stack." },
      { name: "Up Banking", industry: "FinTech / Neobank", size: "51-200",
        website: "up.com.au", rating: 4.6,
        notes: "One of Australia's best digital banks. Small, tight engineering team. High quality bar. Mostly Ruby and Go." },
      { name: "Seek", industry: "Employment Marketplace", size: "1000+",
        website: "seek.com.au", rating: 4.0,
        notes: "Large tech org going through significant modernisation. Good pay. Pair programming exercise focused on Rails." },
      { name: "SafetyCulture", industry: "Workplace Safety SaaS", size: "201-1000",
        website: "safetyculture.com", rating: 4.3,
        notes: "Sydney-based but open to remote. Go + React stack. Growing fast. Second round interview scheduled." },
      { name: "Carsales", industry: "Automotive Marketplace", size: "1000+",
        website: "carsales.com.au", rating: 4.4,
        notes: "Received offer at $135k + super. Strong Ruby team. CTO interview was very positive. Considering seriously." },
      { name: "Redbubble", industry: "E-commerce / Print on Demand", size: "201-1000",
        website: "redbubble.com", rating: 4.5,
        notes: "Accepted offer here! Start date in 3 weeks. Great vibe, Ruby + React stack, good team size." },
      { name: "Afterpay", industry: "FinTech / BNPL", size: "1000+",
        website: "afterpay.com", rating: 3.2,
        notes: "Rejected after technical round. Heavy Java stack — not the best fit right now. Would reconsider if I upskill in Java." },
      { name: "Sportsbet", industry: "Sports Betting / Gambling", size: "201-1000",
        website: "sportsbet.com.au", rating: 3.0,
        notes: "Role was filled internally. Industry isn't ideal but the engineering team had good reviews." },
      { name: "Airtasker", industry: "Freelance Marketplace", size: "51-200",
        website: "airtasker.com", rating: 3.5,
        notes: "Applied speculatively. Ruby on Rails stack. No response after follow-up." },
      { name: "MYOB", industry: "Accounting SaaS", size: "1000+",
        website: "myob.com", rating: 3.3,
        notes: "No response after 3 follow-ups. Mostly .NET stack. Would only consider for the right role." },
      { name: "Finder", industry: "Financial Comparison", size: "201-1000",
        website: "finder.com.au", rating: 3.6,
        notes: "Contract role via LinkedIn. React + Next.js stack. Applied 6 weeks ago, no response." },
      { name: "Telstra", industry: "Telecommunications", size: "1000+",
        website: "telstra.com.au", rating: 3.1,
        notes: "Withdrew after accepting Redbubble offer. Graduate program — would have been a fallback option." },
      { name: "Hipages", industry: "Home Services Marketplace", size: "51-200",
        website: "hipages.com.au", rating: 3.7,
        notes: "Listing was removed before I could progress. Ruby on Rails shop. Worth keeping an eye on." }
    ]
  end

  def seed_contacts(demo_user, orgs_by_name, jobs_by_company)
    contacts_data.each do |c|
      org = orgs_by_name[c[:org]]
      contact = demo_user.contacts.create!(
        name: c[:name],
        role: c[:role],
        email: c[:email],
        linkedin_url: c[:linkedin_url],
        notes: c[:notes],
        organisation: org
      )

      Array(c[:jobs]).each do |company_name|
        job = jobs_by_company[company_name]
        ContactJob.create!(contact: contact, job: job) if job
      end

      Array(c[:interactions]).each do |i|
        contact.contact_interactions.create!(
          interaction_type: i[:type],
          notes: i[:notes],
          occurred_at: i[:occurred_at]
        )
      end
    end
  end

  def contacts_data
    [
      { name: "Sarah Chen", role: "Technical Recruiter", email: "s.chen@seek.com.au",
        linkedin_url: "https://linkedin.com/in/sarahchen-seek", org: "Seek",
        jobs: [ "Seek" ],
        notes: "Very responsive recruiter. Gave good feedback after each round.",
        interactions: [
          { type: "linkedin", notes: "Connected and introduced herself.", occurred_at: 31.days.ago },
          { type: "call", notes: "Spoke about the role, team structure, and interview process.", occurred_at: 25.days.ago },
          { type: "email", notes: "Sent take-home brief and timeline.", occurred_at: 22.days.ago }
        ] },

      { name: "Tom Nguyen", role: "Senior Software Engineer", email: "t.nguyen@seek.com.au",
        org: "Seek", jobs: [ "Seek" ],
        notes: "Ran the pair programming round. Very collaborative style, explained problems clearly.",
        interactions: [
          { type: "interview", notes: "90-minute pair programming session on a Rails feature. Good conversation about architecture.", occurred_at: 15.days.ago }
        ] },

      { name: "Marcus Webb", role: "Engineering Manager", email: "m.webb@up.com.au",
        org: "Up Banking", jobs: [ "Up Banking" ],
        notes: "Down-to-earth EM. Focused a lot on how we handle failure and on-call culture.",
        interactions: [
          { type: "call", notes: "Phone screen with Marcus. Talked about the Go migration and team structure.", occurred_at: 26.days.ago }
        ] },

      { name: "Priya Sharma", role: "Talent Acquisition", email: "priya.sharma@carsales.com.au",
        linkedin_url: "https://linkedin.com/in/priyasharma-carsales", org: "Carsales",
        jobs: [ "Carsales" ],
        notes: "Fast communication throughout. Kept me updated at every step.",
        interactions: [
          { type: "email", notes: "Initial outreach about the Ruby Developer role.", occurred_at: 44.days.ago },
          { type: "call", notes: "Screening call — discussed experience and salary expectations.", occurred_at: 40.days.ago },
          { type: "email", notes: "Confirmed final round interview time and panel members.", occurred_at: 12.days.ago }
        ] },

      { name: "James Thornton", role: "CTO", org: "Carsales",
        jobs: [ "Carsales" ],
        notes: "Interviewed in the final panel. Asked a lot about system design and team leadership experience.",
        interactions: [
          { type: "interview", notes: "Final panel interview. James focused on distributed systems and scaling challenges.", occurred_at: 10.days.ago }
        ] },

      { name: "Lena Fischer", role: "Senior Engineer", email: "lena@buildkite.com",
        linkedin_url: "https://linkedin.com/in/lenafischer-buildkite", org: "Buildkite",
        jobs: [ "Buildkite" ],
        notes: "Friend who made the referral. Been at Buildkite for 2 years, loves the async culture.",
        interactions: [
          { type: "coffee_chat", notes: "Caught up over coffee. She walked me through the interview process and what the team is like.", occurred_at: 15.days.ago },
          { type: "linkedin", notes: "She tagged the hiring manager in a comment on my profile.", occurred_at: 13.days.ago }
        ] },

      { name: "Aisha Okonkwo", role: "Technical Recruiter", email: "a.okonkwo@zendesk.com",
        org: "Zendesk", jobs: [ "Zendesk" ],
        notes: "Reached out via LinkedIn. Professional and clear about the process.",
        interactions: [
          { type: "linkedin", notes: "Inbound message about a Software Engineer II role.", occurred_at: 33.days.ago },
          { type: "email", notes: "Sent role description and asked for availability for a phone screen.", occurred_at: 31.days.ago },
          { type: "call", notes: "20-minute screening call. Passed to take-home stage.", occurred_at: 28.days.ago }
        ] }
    ]
  end

  def manual_entries
    [
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
    ]
  end
end
