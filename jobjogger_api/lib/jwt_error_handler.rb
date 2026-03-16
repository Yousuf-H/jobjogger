class JwtErrorHandler
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call(env)
  rescue JWT::DecodeError, JWT::Base64DecodeError => e
    [
      401,
      { 'Content-Type' => 'application/json' },
      [{ error: 'Invalid token' }.to_json]
    ]
  end
end