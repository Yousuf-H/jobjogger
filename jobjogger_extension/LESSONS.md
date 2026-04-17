# Recurring Issues — Extension

A living list of mistakes that have appeared in review more than once.
Check this before opening a PR that touches the browser extension.

---

## 1. Always validate the origin of messages from the content script

**The pattern:** Listening to `chrome.runtime.onMessage` without checking the sender.

**Why it matters:** Any page or injected script can send messages to your extension.
Without origin validation, malicious sites can trigger extension actions.

**The rule:** Always check `sender.origin` or `sender.tab` before acting on a message.

```ts
// Bad
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
})

// Good
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) return  // reject messages not from a tab
  handleMessage(message)
})
```

---

## 2. Don't store sensitive data in extension local storage unencrypted

**The pattern:** Storing auth tokens or user data directly in `chrome.storage.local`.

**Why it matters:** Other extensions with `storage` permission can read it. Treat it as
semi-public — never store raw tokens or PII beyond what's necessary.

**The rule:** Store the minimum needed, use session storage for ephemeral auth state,
and clear it on logout.
