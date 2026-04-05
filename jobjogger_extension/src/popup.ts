import { config } from "./config";
import type { ExtractedJob, ExtractionResult } from "./types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const root = document.getElementById("root")!;
const headerRight = document.getElementById("header-right")!;

interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

async function checkAuth(): Promise<CurrentUser | null> {
  try {
    const response = await fetch(`${config.apiUrl}/users/me`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

async function checkDuplicate(jobUrl: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${config.apiUrl}/jobs?job_url=${encodeURIComponent(jobUrl)}`,
      { credentials: "include" },
    );
    if (!response.ok) return null;
    const jobs = await response.json();
    return jobs.length > 0 ? jobs[0].id : null;
  } catch {
    return null;
  }
}

function locationIcon() {
  return `<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#64748b"/>
  </svg>`;
}

function workTypeIcon() {
  return `<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 4H11V2.5A1.5 1.5 0 009.5 1h-3A1.5 1.5 0 005 2.5V4H2.5A1.5 1.5 0 001 5.5v7A1.5 1.5 0 002.5 14h11a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0013.5 4zM6.5 2.5h3V4h-3V2.5z" fill="#64748b"/>
  </svg>`;
}

function salaryIcon() {
  return `<svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 10.25h-1.5v-1h1.5v1zm0-2.5h-1.5c0-2 2.25-1.75 2.25-3.25a1.5 1.5 0 00-3 0h-1.5a3 3 0 016 0c0 2-2.25 1.75-2.25 3.25z" fill="#64748b"/>
  </svg>`;
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    showError("Could not access the current tab.");
    return;
  }

  const currentUser = await checkAuth();

  if (!currentUser) {
    showSignIn();
    return;
  }

  headerRight.innerHTML = `
    <span class="source-badge" id="source-badge"></span>
    <span class="user-name">${escapeHtml(currentUser.name || currentUser.email)}</span>
  `;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["dist/content.js"],
  });

  const result: ExtractionResult = await chrome.tabs.sendMessage(tab.id, {
    type: "EXTRACT_JOB",
  });

  if (result.success) {
    const badge = document.getElementById("source-badge");
    if (badge) badge.textContent = result.job.source;
    await renderJob(result.job);
  } else {
    showError(result.error);
  }
}

async function renderJob(job: ExtractedJob) {
  const descriptionPreview = job.jobDescription
    ? job.jobDescription
        .replace(/[#*_`]/g, "")
        .slice(0, 140)
        .trim() + "..."
    : null;

  const metaItems = [
    job.location
      ? `<div class="meta-item">${locationIcon()}<span>${escapeHtml(job.location)}</span></div>`
      : "",
    job.workType
      ? `<div class="meta-item">${workTypeIcon()}<span>${escapeHtml(job.workType)}</span></div>`
      : "",
    job.salary
      ? `<div class="meta-item">${salaryIcon()}<span>${escapeHtml(job.salary)}</span></div>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  root.innerHTML = `
    <div class="content">
      <div class="job-header">
        <div class="job-title">${escapeHtml(job.jobTitle ?? "Unknown title")}</div>
        <div class="company-name">${escapeHtml(job.companyName ?? "Unknown company")}</div>
      </div>

      <div class="meta-list">${metaItems}</div>

      <div class="description-box">
        <div class="description-label">Description preview</div>
        <div class="description-text">${escapeHtml(descriptionPreview ?? "No description extracted")}</div>
      </div>

      <button class="btn btn-primary" id="action-btn" disabled>Checking...</button>
      <div class="status" id="status"></div>
    </div>
  `;

  const existingJobId = await checkDuplicate(job.jobUrl);
  const btn = document.getElementById("action-btn") as HTMLButtonElement;

  if (existingJobId) {
    btn.className = "btn btn-saved";
    btn.textContent = "Already saved — View in JobJogger";
    btn.disabled = false;
    btn.addEventListener("click", () => {
      chrome.tabs.create({ url: `${config.appUrl}/jobs/${existingJobId}` });
    });
  } else {
    btn.textContent = "Save to JobJogger";
    btn.disabled = false;
    btn.addEventListener("click", () => saveJob(job));
  }
}

async function saveJob(job: ExtractedJob) {
  const btn = document.getElementById("action-btn") as HTMLButtonElement;
  const status = document.getElementById("status")!;

  btn.disabled = true;
  btn.textContent = "Saving...";
  status.textContent = "";
  status.className = "status";

  try {
    const response = await fetch(`${config.apiUrl}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        job: {
          job_title: job.jobTitle,
          company_name: job.companyName,
          location: job.location,
          job_description: job.jobDescription,
          job_url: job.jobUrl,
          employment_type: normalizeEmploymentType(job.workType),
          salary_range: job.salary,
          source: job.source,
          status: "wishlist",
        },
      }),
    });

    if (!response.ok) throw new Error("Failed to save job");

    const data = await response.json();
    const jobId = data.id;

    btn.textContent = "Saved";
    status.textContent = "Opening in JobJogger...";
    status.className = "status success";

    setTimeout(() => {
      chrome.tabs.create({ url: `${config.appUrl}/jobs/${jobId}` });
    }, 800);
  } catch {
    status.textContent = "Something went wrong. Please try again.";
    status.className = "status error";
    btn.disabled = false;
    btn.textContent = "Save to JobJogger";
  }
}

function showSignIn() {
  root.innerHTML = `
    <div class="signin-state">
      <p class="signin-message">Sign in to JobJogger to save jobs directly from Seek.</p>
      <button class="btn btn-signin" id="signin-btn">Sign in to JobJogger</button>
    </div>
  `;
  document.getElementById("signin-btn")!.addEventListener("click", () => {
    chrome.tabs.create({ url: `${config.appUrl}/signin` });
  });
}

function normalizeEmploymentType(workType: string | null): string | null {
  if (!workType) return null;

  const map: Record<string, string> = {
    "full time": "full_time",
    fulltime: "full_time",
    "part time": "part_time",
    parttime: "part_time",
    casual: "casual",
    "casual/vacation": "casual",
    contract: "contract",
    "contract/temp": "contract",
  };

  return map[workType.toLowerCase()] ?? null;
}

function showError(message: string) {
  root.innerHTML = `
    <div class="error-state">
      <div class="error-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 10.5h-1.5V10h1.5v1.5zm0-3h-1.5V4.5h1.5V8.5z" fill="#475569"/>
        </svg>
      </div>
      <div class="error-title">Not a supported page</div>
      <div class="error-message">${escapeHtml(message)}<br>Navigate to a Seek job listing and try again.</div>
    </div>
  `;
}

init();
