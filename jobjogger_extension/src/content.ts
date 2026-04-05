import { extractSeek } from "./extractors/seek";
import type { ExtractionResult } from "./types";

function extract(): ExtractionResult {
  const url = window.location.href;

  if (url.includes("seek.com.au")) {
    return extractSeek();
  }

  return { success: false, error: "Not a supported job page" };
}

type InjectedWindow = Window & { __jobjoggerInjected?: boolean };

if (!(window as InjectedWindow).__jobjoggerInjected) {
  (window as InjectedWindow).__jobjoggerInjected = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "EXTRACT_JOB") {
      sendResponse(extract());
    }
  });
}
