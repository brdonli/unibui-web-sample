import { type FC } from "react";
import { Job } from "@/types/job";

interface JobCardProps {
  companyName: string;
  jobs: Job[];
  distance: number | null;
  onJobClick: (job: Job) => void;
}

const JobCard: FC<JobCardProps> = ({
  companyName,
  jobs,
  distance,
  onJobClick,
}) => {
  const getCompanyInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <article className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold bg-orange-600"
            aria-label={`${companyName} logo`}
          >
            {getCompanyInitial(companyName)}
          </div>
          <h3 className="ml-4 text-xl font-semibold">{companyName}</h3>
        </div>
        {distance !== null && (
          <span className="text-sm text-gray-500" role="text">
            {distance.toFixed(1)} miles away
          </span>
        )}
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <button
            key={job.id}
            className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            onClick={() => onJobClick(job)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">
                  {job.requirements.includes("Part Time")
                    ? "Part Time"
                    : "Full Time"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">TBD/hr</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
};

export default JobCard;
