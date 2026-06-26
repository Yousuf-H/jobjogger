# frozen_string_literal: true

namespace :demo do
  desc "Reset demo account data"
  task reset: :environment do
    DemoAccountResetter.new.call
  end

  desc "Create demo user in production"
  task create: :environment do
    if User.exists?(demo: true)
      puts "Demo user already exists."
    else
      password = SecureRandom.hex(16)

      User.create!(
        email: "demo@jobjogger.com",
        password: password,
        password_confirmation: password,
        name: "Demo User",
        demo: true
      )
      puts "Demo user created: demo@jobjogger.com"
    end
  end
end
