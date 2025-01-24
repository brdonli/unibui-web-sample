import { Job } from "@/types/job";

interface JobCardProps {
  companyName: string;
  jobs: Job[];
  distance: number | null;
  onJobClick: (job: Job) => void;
}

const JobCard = ({ companyName, jobs, distance, onJobClick }: JobCardProps) => {
  const getRandomLogo = () => {
    return companyName.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold bg-blue-500`}
          >
            {getRandomLogo()}
          </div>
          <h3 className="ml-4 text-xl font-semibold">{companyName}</h3>
        </div>
        {distance !== null && (
          <span className="text-sm text-gray-500">
            {distance.toFixed(1)} miles away
          </span>
        )}
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onJobClick?.(job)}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobCard;
