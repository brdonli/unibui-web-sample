import { Job } from "@/types/job";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface JobDetailProps {
  companyName: string;
  jobs: Job[];
  onBack: () => void;
}

const JobDetail = ({ companyName, jobs, onBack }: JobDetailProps) => {
  // Get the first job to extract company info
  const firstJob = jobs[0];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header Image */}
      <div className="relative h-48 bg-red-600">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowLeftIcon className="h-6 w-6 text-white" />
          </button>
          <div className="flex gap-4">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <HeartIcon className="h-6 w-6 text-white" />
            </button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <ShareIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="relative px-4 pb-20">
        <div className="flex items-center -mt-8">
          <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center text-yellow-400 text-2xl font-bold">
            {companyName.charAt(0)}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold">{companyName}</h1>
          <p className="text-lg text-gray-600 mt-1">Company Description</p>
          <Link
            href={`https://maps.google.com/?q=${firstJob.location}`}
            className="text-blue-500 hover:underline mt-2 block"
          >
            {firstJob.location}
          </Link>
        </div>

        {/* About Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-gray-600">{firstJob.description}</p>
        </div>

        {/* Jobs Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Jobs ({jobs.length})</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="text-gray-600 mt-1">
                  TBD ·{" "}
                  {job.requirements.includes("Part Time")
                    ? "Part Time"
                    : "Full Time"}
                </p>
                <button className="w-full mt-4 bg-white border border-gray-200 rounded-full py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <span className="text-orange-500">⚡</span>
                  Verify To Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
