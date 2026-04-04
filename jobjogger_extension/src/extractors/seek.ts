import type { ExtractionResult } from "../types";

export function extractSeek(): ExtractionResult {
  const url = window.location.href;

  if (!isSeekJobPage(url)) {
    return { success: false, error: "Not a supported job page" };
  }

  try {
    const jobTitle = extractText('[data-automation="job-detail-title"]');
    const companyName = extractText('[data-automation="advertiser-name"]');
    const location = extractText('[data-automation="job-detail-location"]');
    const jobDescription = extractText('[data-automation="jobAdDetails"]');

    return {
      success: true,
      job: {
        source: "seek",
        jobTitle,
        companyName,
        location,
        jobDescription,
        jobUrl: url,
        extractedAt: new Date().toISOString(),
      },
    };
  } catch {
    return { success: false, error: "Failed to extract job data" };
  }
}

function isSeekJobPage(url: string): boolean {
  return /seek\.com\.au\/job\/\d+/.test(url);
}

function extractText(selector: string): string | null {
  const el = document.querySelector(selector);
  return el ? (el.textContent?.trim() ?? null) : null;
}
