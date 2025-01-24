// Save job IDs to localStorage
export const saveJob = (jobId: string): void => {
  const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  if (!savedJobs.includes(jobId)) {
    savedJobs.push(jobId);
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }
};

// Remove job ID from localStorage
export const unsaveJob = (jobId: string): void => {
  const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  const updatedJobs = savedJobs.filter((id: string) => id !== jobId);
  localStorage.setItem("savedJobs", JSON.stringify(updatedJobs));
};

// Check if job is saved
export const isJobSaved = (jobId: string): boolean => {
  const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  return savedJobs.includes(jobId);
};
