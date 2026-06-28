# frozen_string_literal: true

require "net/http"
require "json"

module Ai
  # Compares a job's linked resume PDF against the job description using the
  # Gemini API and returns a structured match analysis.
  #
  # Results are persisted in `ResumeMatchAnalysis` and served from cache when
  # the resume variant and job description have not changed since the last run.
  # The cache key is `(job_id, resume_variant_id, job_description_digest)`.
  #
  # @example
  #   result = Ai::ResumeMatchService.new(job).call
  #   result[:score]            # => 82
  #   result[:cached]           # => false (first run) or true (cache hit)
  #   result[:strengths]        # => ["Strong Ruby background", ...]
  #   result[:weaknesses]       # => ["Limited React experience", ...]
  #   result[:missing_keywords] # => ["TypeScript", "Docker", ...]
  class ResumeMatchService
    GEMINI_MODEL = "gemma-4-26b-a4b-it"
    GEMINI_URL   = "https://generativelanguage.googleapis.com/v1beta/models/#{GEMINI_MODEL}:generateContent"

    # @param job [Job] A persisted Job instance with an associated resume variant and job description.
    def initialize(job)
      @job = job
    end

    # Runs the match analysis, returning a cached result when available.
    #
    # @return [Hash] Keys: `:score` (Integer), `:strengths` (Array<String>),
    #   `:weaknesses` (Array<String>), `:missing_keywords` (Array<String>),
    #   `:cached` (Boolean).
    # @raise [RuntimeError] If the PDF cannot be read, Gemini returns a non-200
    #   response, or the response JSON cannot be parsed.
    def call
      digest = ResumeMatchAnalysis.digest_for(@job.job_description)

      cached = @job.resume_match_analysis
      if cached &&
          cached.resume_variant_id == @job.resume_variant_id &&
          cached.job_description_digest == digest
        return to_result_hash(cached, cached: true)
      end

      resume_text = extract_resume_text
      prompt      = build_prompt(resume_text)
      raw_json    = call_gemini(prompt)
      result      = parse_response(raw_json)

      ResumeMatchAnalysis.upsert(
        {
          job_id:                  @job.id,
          resume_variant_id:       @job.resume_variant_id,
          job_description_digest:  digest,
          score:                   result[:score],
          strengths:               result[:strengths],
          weaknesses:              result[:weaknesses],
          missing_keywords:        result[:missing_keywords],
          created_at:              Time.current,
          updated_at:              Time.current
        },
        unique_by: :job_id,
        update_only: %i[resume_variant_id job_description_digest score strengths weaknesses missing_keywords updated_at],
        record_timestamps: false
      )

      result.merge(cached: false)
    end

    private

    def to_result_hash(record, cached:)
      {
        score:            record.score,
        strengths:        record.strengths,
        weaknesses:       record.weaknesses,
        missing_keywords: record.missing_keywords,
        cached:           cached
      }
    end

    def extract_resume_text
      pdf_bytes = @job.resume_variant.pdf.download
      reader    = PDF::Reader.new(StringIO.new(pdf_bytes))
      text      = reader.pages.map(&:text).join("\n").strip

      raise "Could not extract text from resume PDF — the file may be scanned or image-only" if text.empty?

      text
    rescue PDF::Reader::MalformedPDFError => e
      raise "Failed to read resume PDF: #{e.message}"
    end

    def build_prompt(resume_text)
      <<~PROMPT
        You are a resume analyst. Compare the resume below against the job description and return ONLY a JSON object with no explanation, no markdown, no backticks. Just raw JSON.

        Return this exact structure:
        {
          "score": <integer 0-100>,
          "strengths": [<string>, ...],
          "weaknesses": [<string>, ...],
          "missing_keywords": [<string>, ...]
        }

        Job Title: #{@job.job_title}

        Job Description:
        #{@job.job_description}

        Resume:
        #{resume_text}
      PROMPT
    end

    def call_gemini(prompt)
      api_key = ENV.fetch("GEMINI_API_KEY")
      uri     = URI("#{GEMINI_URL}?key=#{api_key}")

      body = {
        contents: [
          { parts: [ { text: prompt } ] }
        ]
      }

      http         = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      request      = Net::HTTP::Post.new(uri)
      request["Content-Type"] = "application/json"
      request.body = body.to_json

      response = http.request(request)

      unless response.is_a?(Net::HTTPSuccess)
        raise "Gemini API error (#{response.code}): #{response.body}"
      end

      data  = JSON.parse(response.body)
      parts = data.dig("candidates", 0, "content", "parts") || []
      text  = parts.find { |p| !p["thought"] }&.dig("text")

      raise "Empty response from Gemini" if text.blank?

      text
    rescue JSON::ParserError => e
      raise "Failed to parse Gemini API response: #{e.message}"
    end

    def parse_response(text)
      result = JSON.parse(text.strip)
      result.transform_keys(&:to_sym)
    rescue JSON::ParserError => e
      raise "Failed to parse match result JSON from Gemini: #{e.message}"
    end
  end
end
