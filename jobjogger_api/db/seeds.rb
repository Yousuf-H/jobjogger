TimelineEntry.destroy_all
Job.destroy_all
User.destroy_all

puts "Cleaned existing data"

demo_user = User.create!(
  email: "demo@jobjogger.com",
  password: "password123",
  password_confirmation: "password123",
  name: "John Doe"
)

puts "Created demo user: #{demo_user.email}"

Job.create!(
  user: demo_user,
  company_name: "Addressfinder",
  job_title: "Junior Software Dev",
  status: "wishlist",
  job_url: "www.addressfinder.co.nz",
  tags: ["software development", "junior"]
)

Job.create!(
  user: demo_user,
  company_name: "Abeltec",
  job_title: "Senior Software Dev",
  status: "wishlist",
  job_url: "www.abeltec.co.nz",
  tags: ["software development", "senior", "Abletech"],
  follow_up_date: 1.week.ago
)

Job.create!(
  user: demo_user,
  company_name: "Amazon",
  job_title: "Data Engineer",
  status: "wishlist",
  job_url: "www.amazon.com",
  tags: ["Data Engineer", "Amazon"],
  follow_up_date: 1.day.from_now
)

job_at_netflix = Job.create!(
  user: demo_user,
  company_name: "Netflix",
  job_title: "Dev Ops",
  status: "wishlist",
  job_url: "www.netflix.com",
  tags: ["Netflix", "Dev Ops"]
)
job_at_netflix.update!(status: "applied")

Job.create!(
  user: demo_user,
  company_name: "Microsoft",
  job_title: "CEO",
  status: "rejected",
  job_url: "www.microsoft.com",
  tags: ["Microsoft", "CEO"]
)

job_at_google = Job.create!(
  user: demo_user,
  company_name: "Google",
  job_title: "CEO",
  status: "applied",
  job_url: "www.google.com",
  tags: ["Google", "CEO"]
)

TimelineEntry.create!(
  job: job_at_google,
  entry_type: "note",
  description: "I applied for the job finally!",
  occurred_at: Time.current
)

Job.create!(
  user: demo_user,
  company_name: "NASA",
  job_title: "HR",
  status: "phone_screen",
  job_url: "www.nasa.com",
  tags: ["NASA", "HR"],
  archived_at: Date.current
)

puts "Created #{Job.count} jobs for demo user"
puts "Signin with: demo@jobjogger.com / password123"