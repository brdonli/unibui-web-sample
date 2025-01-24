import { Job } from "@/types/job";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { saveJob, unsaveJob, isJobSaved } from "@/utils/saveJobs";

interface JobDetailPageProps {
  companyJobs: Job[];
  onBack: () => void;
}

const JobDetailPage = ({ companyJobs, onBack }: JobDetailPageProps) => {
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const initialSavedState = companyJobs.reduce(
      (acc, job) => ({
        ...acc,
        [job.id]: isJobSaved(job.id),
      }),
      {}
    );
    setSavedJobs(initialSavedState);
  }, [companyJobs]);

  const handleSaveToggle = (jobId: string) => {
    const newSavedState = !savedJobs[jobId];
    setSavedJobs((prev) => ({
      ...prev,
      [jobId]: newSavedState,
    }));

    if (newSavedState) {
      saveJob(jobId);
    } else {
      unsaveJob(jobId);
    }
  };

  if (!companyJobs.length) return null;

  const company = companyJobs[0]; // Get first job to access company info

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 300,
      }}
    >
      {/* Header Image */}
      <div className="relative h-48 bg-red-600">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 backdrop-blur-sm"
        >
          <ArrowLeftIcon className="h-6 w-6 text-white" />
        </button>
        <div className="absolute top-4 right-4 flex gap-4">
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
            <HeartIcon className="h-6 w-6 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
            <ShareIcon className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="px-4 -mt-12 relative">
        <div className="bg-red-600 w-24 h-24 rounded-xl flex items-center justify-center mb-4">
          <span className="text-3xl text-white font-bold">
            {company.companyName.charAt(0)}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{company.companyName}</h1>
        <p className="text-lg mb-4">{company.companyName}</p>
        <p className="text-blue-500 mb-8">{company.location}</p>

        {/* About Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-gray-600">
            {company.description || "No description available."}
          </p>
        </section>

        {/* Jobs Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Jobs ({companyJobs.length})
          </h2>
          <div className="space-y-4">
            {companyJobs.map((job) => (
              <div key={job.id} className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <button
                    onClick={() => handleSaveToggle(job.id)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <HeartIcon
                      className={`h-6 w-6 ${
                        savedJobs[job.id]
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  TBD ·{" "}
                  {job.requirements.includes("Part Time")
                    ? "Part Time"
                    : "Full Time"}
                </p>
                <button className="w-full py-3 px-4 bg-white border border-gray-200 rounded-full flex items-center justify-center gap-2 text-coral-500 font-medium">
                  <span className="text-lg">⚡</span> Verify To Apply
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center text-coral-500">
              <span className="text-2xl">📍</span>
              <span className="text-sm">Nearby</span>
            </button>
            <button className="flex flex-col items-center text-gray-400">
              <span className="text-2xl">🎁</span>
              <span className="text-sm">Rewards</span>
            </button>
            <button className="flex flex-col items-center text-gray-400">
              <span className="text-2xl">👤</span>
              <span className="text-sm">Profile</span>
            </button>
          </div>
        </nav>

        {/* Bottom Padding for Navigation */}
        <div className="h-24" />
      </div>
    </motion.div>
  );
};

export default JobDetailPage;
