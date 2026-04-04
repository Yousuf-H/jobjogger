import { config } from "./config";
import type { ExtractedJob, ExtractionResult } from "./types";

const root = document.getElementById("root")!;
const sourceBadge = document.getElementById("source-badge")!;

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

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    showError("Could not access current tab.");
    return;
  }

  const currentUser = await checkAuth();

  if (!currentUser) {
    showSignIn();
    return;
  }

  showUserBadge(currentUser.name || currentUser.email);

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["dist/content.js"],
  });

  const result: ExtractionResult = await chrome.tabs.sendMessage(tab.id, {
    type: "EXTRACT_JOB",
  });

  if (result.success) {
    sourceBadge.textContent = result.job.source;
    await renderJob(result.job);
  } else {
    showError(result.error);
  }
}

function showUserBadge(name: string) {
  const header = document.querySelector(".header")!;
  const badge = document.createElement("span");
  badge.style.cssText = "margin-left: auto; font-size: 11px; color: #64748b;";
  badge.textContent = name;
  header.appendChild(badge);
}

function showSignIn() {
  root.innerHTML = `
    <div class="card">
      <p style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">
        Sign in to JobJogger to save jobs directly from Seek.
      </p>
      <button class="btn-save" id="signin-btn">Sign in to JobJogger</button>
    </div>
  `;
  document.getElementById("signin-btn")!.addEventListener("click", () => {
    chrome.tabs.create({ url: `${config.appUrl}/signin` });
  });
}

async function renderJob(job: ExtractedJob) {
  const descriptionPreview = job.jobDescription
    ? job.jobDescription.slice(0, 120).trim() + "..."
    : null;

  const existingJobId = await checkDuplicate(job.jobUrl);

  root.innerHTML = `
    <div class="card">
      <div class="job-title">${job.jobTitle ?? "Unknown title"}</div>
      <div class="company">${job.companyName ?? "Unknown company"}</div>
      <div class="meta">
        ${job.location ? `<div class="meta-item"><span class="meta-icon">📍</span>${job.location}</div>` : ""}
        ${job.salary ? `<div class="meta-item"><span class="meta-icon">💰</span>${job.salary}</div>` : ""}
        <div class="meta-item"><span class="meta-icon">🔗</span>${new URL(job.jobUrl).hostname}</div>
      </div>
      ${
        descriptionPreview
          ? `<div class="description-preview has-content">${descriptionPreview}</div>`
          : `<div class="description-preview">No description extracted</div>`
      }
    </div>
    <div class="actions">
      ${
        existingJobId
          ? `<button class="btn-save btn-already-saved" id="view-btn">Already saved — View in JobJogger</button>`
          : `<button class="btn-save" id="save-btn">Save to JobJogger</button>`
      }
    </div>
    <div class="status" id="status"></div>
  `;

  if (existingJobId) {
    document.getElementById("view-btn")!.addEventListener("click", () => {
      chrome.tabs.create({ url: `${config.appUrl}/jobs/${existingJobId}` });
    });
  } else {
    document
      .getElementById("save-btn")!
      .addEventListener("click", () => saveJob(job));
  }
}

async function saveJob(job: ExtractedJob) {
  const btn = document.getElementById("save-btn") as HTMLButtonElement;
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
          salary_range: job.salary,
          source: job.source,
          status: "wishlist",
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save job");
    }

    const data = await response.json();
    const jobId = data.id;

    btn.textContent = "✓ Saved!";
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

function showError(message: string) {
  root.innerHTML = `<div class="error">😕 ${message}<br><br>Navigate to a job listing page and try again.</div>`;
}

init();
