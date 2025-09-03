// Default threads
export let appSettings = {
  threads: ["Red", "Yellow", "White"],
};

// Helper to update threads dynamically (local)
export const updateThreads = (newThreads) => {
  appSettings.threads = newThreads;
};
