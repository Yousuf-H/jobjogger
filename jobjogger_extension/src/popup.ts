import type { ExtractionResult } from "./types";

const root = document.getElementById("root")!;

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
    root.innerHTML = `<pre>${JSON.stringify(result.job, null, 2)}</pre>`;
  } else {
    showError(result.error);
  }
}

function showError(message: string) {
  root.innerHTML = `<div class="error">${message}</div>`;
}

init();
