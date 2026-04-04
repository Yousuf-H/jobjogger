const isDev = !("update_url" in chrome.runtime.getManifest());

export const config = {
  apiUrl: isDev
    ? "http://localhost:3000/api/v1"
    : "https://api.jobjogger.com/api/v1",
  appUrl: isDev ? "http://localhost:5173" : "https://jobjogger.com",
};
