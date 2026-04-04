import { config } from "./config";
import type { ExtractedJob, ExtractionResult } from "./types";

const root = document.getElementById("root")!;
const sourceBadge = document.getElementById("source-badge")!;

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    showError("Could not access current tab.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["dist/content.js"],
  });

  const result: ExtractionResult = await chrome.tabs.sendMessage(tab.id, {
    type: "EXTRACT_JOB",
  });

  if (result.success) {
    sourceBadge.textContent = result.job.source;
    renderJob(result.job);
  } else {
    showError(result.error);
  }
}

function renderJob(job: ExtractedJob) {
  const descriptionPreview = job.jobDescription
    ? job.jobDescription.slice(0, 120).trim() + "..."
    : null;

  root.innerHTML = `
    <div class="card">
      <div class="job-title">${job.jobTitle ?? "Unknown title"}</div>
      <div class="company">${job.companyName ?? "Unknown company"}</div>
      <div class="meta">
        ${job.location ? `<div class="meta-item"><span class="meta-icon">📍</span>${job.location}</div>` : ""}
        <div class="meta-item"><span class="meta-icon">🔗</span>${new URL(job.jobUrl).hostname}</div>
      </div>
      ${
        descriptionPreview
          ? `<div class="description-preview has-content">${descriptionPreview}</div>`
          : `<div class="description-preview">No description extracted</div>`
      }
    </div>
    <div class="actions">
      <button class="btn-save" id="save-btn">Save to JobJogger</button>
    </div>
    <div class="status" id="status"></div>
  `;

  document
    .getElementById("save-btn")!
    .addEventListener("click", () => saveJob(job));
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
          source: job.source,
          status: "wishlist",
        },
      }),
    });

    if (response.status === 401) {
      status.textContent = "Please log in to JobJogger first.";
      status.className = "status error";
      btn.disabled = false;
      btn.textContent = "Save to JobJogger";
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to save job");
    }

    const data = await response.json();
    const jobId = data.job?.id;

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
