class Rack::Attack
  # Throttle sign in attempts by IP
  throttle("sign_in/ip", limit: 5, period: 20.seconds) do |req|
    req.ip if req.path == "/api/v1/users/sign_in" && req.post?
  end

  # Throttle sign up attempts by IP
  throttle("sign_up/ip", limit: 5, period: 20.seconds) do |req|
    req.ip if req.path == "/api/v1/users" && req.post?
  end

  # Throttle demo session attempts by IP
  throttle("demo_session/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path == "/api/v1/demo/session" && req.post?
  end

  # Global throttle — limit aggressive scanners
  throttle("global/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Return JSON 429 instead of default text response
  self.throttled_responder = lambda do |_env|
    [
      429,
      { "Content-Type" => "application/json" },
      [ { status: { code: 429, message: "Too many requests. Please try again later." } }.to_json ]
    ]
  end
end
