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
      demo_user.contacts.destroy_all
      demo_user.jobs.destroy_all
      demo_user.organisations.destroy_all
      demo_user.interview_questions.destroy_all
      demo_user.resume_templates.destroy_all

      orgs_by_name = seed_organisations(demo_user)
      jobs_by_company = seed_jobs(demo_user, orgs_by_name)
      seed_timeline_entries(jobs_by_company)
      seed_contacts(demo_user, orgs_by_name, jobs_by_company)
      seed_interviews(jobs_by_company)
      seed_interview_questions(demo_user, orgs_by_name, jobs_by_company)
      seed_resume_templates(demo_user, jobs_by_company)
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

  def seed_interviews(jobs_by_company)
    interview_data.each do |entry|
      job = jobs_by_company[entry[:company]]
      next unless job

      entry[:interviews].each do |i|
        job.interviews.create!(
          scheduled_at: i[:scheduled_at],
          interview_type: i[:interview_type],
          format: i[:format],
          location_or_link: i[:location_or_link],
          prep_notes: i[:prep_notes],
          debrief_notes: i[:debrief_notes],
          outcome: i[:outcome] || "pending"
        )
      end
    end
  end

  def seed_interview_questions(demo_user, orgs_by_name, jobs_by_company)
    interview_questions_data.each do |q|
      demo_user.interview_questions.create!(
        question: q[:question],
        answer: q[:answer],
        category: q[:category],
        is_favourite: q[:is_favourite] || false,
        job: q[:job_name] ? jobs_by_company[q[:job_name]] : nil,
        organisation: q[:org_name] ? orgs_by_name[q[:org_name]] : nil
      )
    end
  end

  def interview_data
    [
      # Zendesk — phone_screen, round 1 upcoming in 2 days
      { company: "Zendesk", interviews: [
        { scheduled_at: 2.days.from_now.change(hour: 10, min: 0),
          interview_type: "phone_screen", format: "phone",
          location_or_link: nil,
          prep_notes: "## Prep Notes\n\n**Key points to cover:**\n- 4 years Rails experience, strong on API design\n- Comfortable with large-scale SaaS\n- Ask about team structure and on-call expectations\n\n**Research:**\n- Zendesk acquired Momentive in 2022 — understand the product suite\n- Ruby + React stack, microservices direction",
          debrief_notes: nil, outcome: "pending" }
      ] },

      # Up Banking — phone_screen, past round, no debrief yet
      { company: "Up Banking", interviews: [
        { scheduled_at: 5.days.ago.change(hour: 14, min: 30),
          interview_type: "phone_screen", format: "video",
          location_or_link: "https://whereby.com/upbanking-interviews",
          prep_notes: "## Prep Notes\n\n- Research Up's engineering blog\n- They use Ruby and are migrating parts to Go\n- Marcus Webb is EM — LinkedIn shows he values async communication\n\n**Questions to ask:**\n- How does the team balance feature work vs tech debt?\n- What does on-call look like?",
          debrief_notes: "Went well overall. Marcus was down to earth. He spent a lot of time on how we handle failure and on-call culture. I gave a good answer about our incident postmortems at the last job.\n\n**Next step:** Take-home task — build a small API endpoint.",
          outcome: "passed" }
      ] },

      # Seek — interviewing, 2 rounds complete
      { company: "Seek", interviews: [
        { scheduled_at: 25.days.ago.change(hour: 11, min: 0),
          interview_type: "phone_screen", format: "phone",
          location_or_link: nil,
          prep_notes: "## Prep Notes\n\n- Sarah Chen is the recruiter, very responsive\n- Focus on Rails and React experience\n- Be ready to talk salary expectations ($120k-$150k range)",
          debrief_notes: "Short 20-minute call with Sarah. She asked about availability, salary, and why I'm looking. Very friendly. Moved straight to the technical round.",
          outcome: "passed" },
        { scheduled_at: 15.days.ago.change(hour: 13, min: 0),
          interview_type: "technical", format: "video",
          location_or_link: "https://zoom.us/j/seek-technical",
          prep_notes: "## Technical Round Prep\n\n**Format:** 90-minute pair programming on a Rails feature\n\n**Practice areas:**\n- ActiveRecord associations and scopes\n- RESTful API design\n- Writing clean, testable Ruby\n- RSpec basics\n\n**Tom Nguyen** (Senior Engineer) will be running it — check his GitHub.",
          debrief_notes: "## How it went\n\nBuilt a small feature to add tagging to a model. Tom was collaborative and dropped hints when I got stuck — not adversarial at all.\n\n**What went well:**\n- Clean service object pattern\n- Good test coverage\n- Asked good clarifying questions upfront\n\n**What I'd improve:**\n- Took too long on the DB index decision — should be more decisive\n\n**Next step:** Final culture fit round with the team lead.",
          outcome: "passed" }
      ] },

      # SafetyCulture — interviewing, round 1 past, round 2 upcoming
      { company: "SafetyCulture", interviews: [
        { scheduled_at: 20.days.ago.change(hour: 9, min: 30),
          interview_type: "phone_screen", format: "video",
          location_or_link: "https://meet.google.com/safetyculture-screen",
          prep_notes: "## Prep\n\n- Go + React stack — brush up on Go basics\n- SafetyCulture is mission-driven: workplace safety\n- Growing fast — 2nd round means they're serious",
          debrief_notes: "Good call. They asked about my experience with typed languages and whether I'd be open to learning Go. I said yes and mentioned my TypeScript background. Moved to second round.",
          outcome: "passed" },
        { scheduled_at: 3.days.from_now.change(hour: 14, min: 0),
          interview_type: "panel", format: "video",
          location_or_link: "https://zoom.us/j/safetyculture-panel",
          prep_notes: "## Panel Round Prep\n\n**Panel members:** Engineering Manager + 2 Senior Engineers\n\n**Expect:**\n- System design question (design a checklist feature)\n- Behavioural questions — use STAR format\n- Deep dive on a past project\n\n**Research:**\n- iAuditor product — core inspection/checklist tool\n- They recently raised Series C\n- Go microservices + React frontend\n\n**Questions to ask:**\n- What does the onboarding process look like?\n- How does the team approach technical decisions?",
          debrief_notes: nil, outcome: "pending" }
      ] },

      # Carsales — offer stage, 3 rounds all passed
      { company: "Carsales", interviews: [
        { scheduled_at: 38.days.ago.change(hour: 10, min: 0),
          interview_type: "phone_screen", format: "phone",
          location_or_link: nil,
          prep_notes: "Initial screening with Priya from talent acquisition.",
          debrief_notes: "Quick 15-minute call. Priya confirmed salary range alignment and asked about notice period. Moved to technical round.",
          outcome: "passed" },
        { scheduled_at: 25.days.ago.change(hour: 13, min: 0),
          interview_type: "technical", format: "video",
          location_or_link: "https://zoom.us/j/carsales-tech",
          prep_notes: "## Technical Round\n\n- Rails API design\n- PostgreSQL performance — indexing, query optimisation\n- System design: design a vehicle listing search\n\n**High traffic focus** — carsales.com.au has millions of listings.",
          debrief_notes: "Strong round. They asked me to design a search API for vehicle listings with filtering and pagination. I walked through indexing strategy and discussed caching with Redis. Interviewer seemed impressed with the query optimisation answer.",
          outcome: "passed" },
        { scheduled_at: 10.days.ago.change(hour: 10, min: 0),
          interview_type: "final", format: "in_person",
          location_or_link: "Level 4, 449 Punt Rd, Richmond VIC",
          prep_notes: "## Final Panel — CTO + Team Lead\n\n**James Thornton (CTO)** — LinkedIn shows he values engineering leadership and architectural thinking.\n\n**Prepare:**\n- A story about leading a technical initiative\n- Opinions on monolith vs microservices\n- Questions about engineering culture and roadmap",
          debrief_notes: "## Final Panel\n\nMet James (CTO) and two senior engineers. In-person at their Richmond office — great space.\n\n**Topics covered:**\n- Led most of the discussion on distributed systems\n- Asked about a time I disagreed with a technical decision\n- Culture and values alignment\n\n**Feeling:** Very positive. James said they'd be in touch by end of week.\n\n**Received verbal offer the next day — $135k + super.**",
          outcome: "passed" }
      ] },

      # Redbubble — accepted, 3 rounds all passed
      { company: "Redbubble", interviews: [
        { scheduled_at: 48.days.ago.change(hour: 11, min: 0),
          interview_type: "phone_screen", format: "phone",
          location_or_link: nil,
          prep_notes: "Referral intro. Screening with HR.",
          debrief_notes: "Relaxed call. Talked about the role, team size, and stack. Ruby + React. Good energy.",
          outcome: "passed" },
        { scheduled_at: 38.days.ago.change(hour: 14, min: 0),
          interview_type: "technical", format: "video",
          location_or_link: "https://zoom.us/j/redbubble-tech",
          prep_notes: "Take-home + code review. Focus on clean Ruby and good test coverage.",
          debrief_notes: "Reviewed my take-home task together. They liked the service object pattern. One question about why I didn't use Sidekiq for background jobs — explained the trade-off well.",
          outcome: "passed" },
        { scheduled_at: 22.days.ago.change(hour: 10, min: 0),
          interview_type: "final", format: "video",
          location_or_link: "https://zoom.us/j/redbubble-final",
          prep_notes: "Culture fit + meet the team. Be yourself.",
          debrief_notes: "Met 4 team members. Very relaxed, mostly a two-way conversation. Asked great questions about how they handle tech debt. **Received offer 2 days later.**",
          outcome: "passed" }
      ] },

      # Afterpay — rejected, 2 rounds, failed at technical
      { company: "Afterpay", interviews: [
        { scheduled_at: 33.days.ago.change(hour: 10, min: 0),
          interview_type: "phone_screen", format: "phone",
          location_or_link: nil,
          prep_notes: "Screening call. Afterpay is now part of Block (Jack Dorsey's company).",
          debrief_notes: "Fine call. They were upfront that the stack is heavily Java. I said I was open to it.",
          outcome: "passed" },
        { scheduled_at: 22.days.ago.change(hour: 13, min: 0),
          interview_type: "technical", format: "video",
          location_or_link: "https://zoom.us/j/afterpay-tech",
          prep_notes: "## Technical Round\n\nExpect Java-heavy questions. Review:\n- Spring Boot basics\n- Java collections and generics\n- Microservices patterns",
          debrief_notes: "Struggled with the Java-specific questions. My Spring Boot knowledge wasn't deep enough. The system design part went okay but they needed someone more comfortable in the Java ecosystem.\n\n**Rejection came 3 days later. Lesson: don't apply for roles where the stack is this far from my experience.**",
          outcome: "failed" }
      ] }
    ]
  end

  def interview_questions_data
    [
      # ── Personal — Behavioural ──────────────────────────────────────────────
      { question: "Tell me about yourself.",
        answer: "## My background\n\nI'm a full stack developer with 4 years of experience, primarily in Ruby on Rails and React. I started in a small startup where I owned features end-to-end, then moved to a mid-size product company where I worked on a high-traffic Rails API serving millions of requests.\n\nI'm now looking for a role where I can go deeper on engineering quality and work with a team that cares about clean code and good architecture.",
        category: "behavioural", is_favourite: true },

      { question: "Why are you looking for a new role?",
        answer: "My current team has been great but the product has entered a maintenance phase — most of the interesting architecture work is done. I'm looking for somewhere with harder problems and more room to grow, ideally with a strong engineering culture.",
        category: "behavioural", is_favourite: true },

      { question: "Tell me about a time you handled a difficult technical challenge.",
        answer: "## STAR Format\n\n**Situation:** Our API response times spiked to 4s after a data migration doubled table size.\n\n**Task:** Diagnose and fix without taking the system down.\n\n**Action:** Used `EXPLAIN ANALYZE` to find a missing composite index, added it concurrently, and introduced a Redis cache for the hottest queries.\n\n**Result:** Response time dropped to 180ms. Wrote a runbook so the team could spot the pattern early next time.",
        category: "behavioural" },

      { question: "Describe a time you disagreed with a technical decision. What did you do?",
        answer: "We were going to rewrite a core service in a new framework before understanding the problem well. I raised concerns in the design doc and proposed running a 2-week spike first. The team agreed. The spike showed the rewrite wasn't needed — a refactor solved the problem in half the time.",
        category: "behavioural" },

      { question: "Where do you see yourself in 3–5 years?",
        answer: "I'd like to grow into a senior or lead engineer role — not necessarily managing people, but being a technical anchor for a team. I want to be the person who spots systemic problems early and helps raise the quality bar across the codebase.",
        category: "behavioural" },

      # ── Personal — Technical ───────────────────────────────────────────────
      { question: "Explain how you'd approach optimising a slow Rails API endpoint.",
        answer: "## Approach\n\n1. **Measure first** — use `rack-mini-profiler` or check logs for slow queries\n2. **N+1 queries** — most common culprit, fix with `includes`/`eager_load`\n3. **Missing indexes** — `EXPLAIN ANALYZE` to confirm\n4. **Caching** — fragment cache or Redis for expensive, rarely-changing data\n5. **Pagination** — never return unbounded collections\n6. **Background jobs** — move anything non-critical out of the request cycle",
        category: "technical", is_favourite: true },

      { question: "What's the difference between `has_many :through` and `has_and_belongs_to_many` in Rails?",
        answer: "`has_and_belongs_to_many` (HABTM) is a direct many-to-many with a join table but no model — you can't add extra attributes to the join.\n\n`has_many :through` uses an intermediate model, which means you can add columns, validations, and callbacks to the join. Almost always prefer `:through` — it's more flexible and easier to extend later.",
        category: "technical" },

      { question: "How does Rails handle database transactions and when would you use them?",
        answer: "Rails wraps operations in `ActiveRecord::Base.transaction`. If any exception is raised, everything rolls back.\n\nUse them when multiple writes must succeed or fail together — e.g. creating an order and decrementing stock. Also use `requires_new: true` for nested transactions (savepoints in PostgreSQL).",
        category: "technical" },

      # ── Personal — Questions to Ask ────────────────────────────────────────
      { question: "What does a typical day look like for someone in this role?",
        answer: nil, category: "questions_to_ask", is_favourite: true },

      { question: "How does the team handle technical debt and unplanned work?",
        answer: nil, category: "questions_to_ask", is_favourite: true },

      { question: "What does the on-call rotation look like, and how does the team handle incidents?",
        answer: nil, category: "questions_to_ask" },

      { question: "What are the biggest technical challenges the team is facing in the next 6–12 months?",
        answer: nil, category: "questions_to_ask" },

      { question: "How are technical decisions made — is it top-down or collaborative?",
        answer: nil, category: "questions_to_ask" },

      # ── Org — Atlassian ────────────────────────────────────────────────────
      { question: "Why do you want to work at Atlassian specifically?",
        answer: "Atlassian has always been a benchmark for engineering culture in Australia. The TEAM values feel genuine rather than performative, and the remote-first approach means the engineering process has to be intentional and well-documented — which I find very appealing.\n\nI'm also excited about the scale — working on tools that millions of developers use every day is a different kind of challenge.",
        category: "behavioural",
        org_name: "Atlassian" },

      { question: "How do you approach working in a large distributed codebase?",
        answer: "Strong ownership boundaries, good documentation of interfaces, and investing in tooling. At Atlassian's scale I'd expect well-defined service contracts and feature flags — I've used both and can speak to tradeoffs.",
        category: "technical",
        org_name: "Atlassian" },

      # ── Org — Seek ─────────────────────────────────────────────────────────
      { question: "What do you know about Seek's engineering approach?",
        answer: "From the job description and Sarah's intro, Seek is modernising a large Rails monolith — splitting responsibilities, improving test coverage, and improving deployment pipelines. The pair programming format in the technical round reflects a collaborative, quality-focused culture.\n\nI've worked in a similar context and can speak to strategies for incremental improvement without big-bang rewrites.",
        category: "behavioural",
        org_name: "Seek" },

      # ── Job — Carsales ─────────────────────────────────────────────────────
      { question: "How would you approach scaling a Rails app for millions of vehicle listings?",
        answer: "## Approach\n\n**Read path:**\n- Elasticsearch or Postgres full-text for search with proper indexing\n- Cache popular searches and listing pages (Redis)\n- CDN for images and static assets\n\n**Write path:**\n- Background jobs for heavy processing (image resizing, indexing)\n- Database write replicas for reporting queries\n\n**Architecture:**\n- Consider extracting the search service first — it has the most load\n- Keep core listing CRUD in Rails — don't over-engineer early",
        category: "technical",
        job_name: "Carsales" }
    ]
  end

  def seed_resume_templates(demo_user, jobs_by_company)
    # Template 1 — Full Stack (Ruby + React) — broad base resume
    fullstack = demo_user.resume_templates.create!(
      name: "Full Stack Developer — Ruby & React",
      notes: "General-purpose resume. Emphasises full-stack ownership, React frontend, Rails API, and collaborative delivery."
    )

    v_seek = fullstack.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for Seek — highlighted pair-programming experience and large-scale Rails modernisation work."
    )
    v_safetyculture = fullstack.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for SafetyCulture — emphasised TypeScript experience and openness to learning Go."
    )
    v_buildkite = fullstack.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for Buildkite — foregrounded CI/CD pipeline work, DevTools mindset, and async remote experience."
    )
    v_canva = fullstack.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for Canva — emphasised design-system work, component libraries, and high-scale frontend performance."
    )

    # Template 2 — Backend / Rails — for backend-heavy roles
    backend = demo_user.resume_templates.create!(
      name: "Backend Developer — Ruby & Rails",
      notes: "Backend-focused resume. Leads with API design, PostgreSQL optimisation, and service architecture."
    )

    v_carsales = backend.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for Carsales — led with high-traffic Rails API experience and PostgreSQL query optimisation."
    )
    v_rea = backend.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for REA Group — highlighted Ruby on Rails depth, test-driven development, and property domain familiarity."
    )
    v_upbanking = backend.resume_variants.create!(
      user: demo_user,
      notes: "Tailored for Up Banking — emphasised fintech awareness, API security, and interest in Go."
    )

    # Link variants to their jobs
    {
      "Seek"          => v_seek,
      "SafetyCulture" => v_safetyculture,
      "Buildkite"     => v_buildkite,
      "Canva"         => v_canva,
      "Carsales"      => v_carsales,
      "REA Group"     => v_rea,
      "Up Banking"    => v_upbanking
    }.each do |company, variant|
      job = jobs_by_company[company]
      job&.update_columns(resume_variant_id: variant.id)
    end
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
