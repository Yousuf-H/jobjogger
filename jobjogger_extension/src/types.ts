export type ExtractedJob = {
  source: string;
  jobTitle: string | null;
  companyName: string | null;
  location: string | null;
  jobDescription: string | null;
  jobUrl: string;
  extractedAt: string;
};

export type ExtractionResult =
  | { success: true; job: ExtractedJob }
  | { success: false; error: string };
