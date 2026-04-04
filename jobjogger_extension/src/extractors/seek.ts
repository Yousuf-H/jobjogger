import TurndownService from "turndown";
import type { ExtractionResult } from "../types";

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function extractSeek(): ExtractionResult {
  const url = window.location.href;

  if (!isSeekJobPage(url)) {
    return { success: false, error: "Not a supported job page" };
  }

  try {
    const jobTitle = extractText('[data-automation="job-detail-title"]');
    const companyName = extractText('[data-automation="advertiser-name"]');
    const location = extractText('[data-automation="job-detail-location"]');
    const salary = extractText('[data-automation="job-detail-salary"]');
    const jobDescription = extractMarkdown('[data-automation="jobAdDetails"]');

    return {
      success: true,
      job: {
        source: "seek",
        jobTitle,
        companyName,
        location,
        salary,
        jobDescription,
        jobUrl: normalizeUrl(url),
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

function extractMarkdown(selector: string): string | null {
  const el = document.querySelector(selector);
  if (!el) return null;

  let markdown = turndown.turndown(el.innerHTML);

  markdown = markdown
    .replace(/\*\*([^*]+?)\s*\n\s*\n\s*\*\*(?=\s*\n|\s*$)/g, "**$1**\n\n")
    .replace(/\*\*\s*\n/g, "**\n")
    .replace(/\*\*\n([A-Z])/g, "**\n\n$1")
    .replace(/^- {3}/gm, "- ")
    .replace(/^(\s+)- {3}/gm, "$1- ")
    .replace(/^(- .+)\n\s*\n(?=- )/gm, "$1\n")
    .replace(/^(- .+)\n\s*\n(\s+- )/gm, "$1\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^(\s*\n)+/, "")
    .trim();

  return markdown;
}
