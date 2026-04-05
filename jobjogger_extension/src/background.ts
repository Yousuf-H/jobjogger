chrome.runtime.onMessageExternal.addListener(
  (message, _sender, sendResponse) => {
    if (message.type === "PING") sendResponse({ pong: true });
  },
);
