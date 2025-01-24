import { Job } from "@/types/job";
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import JobCard from "./JobCard";
import { useState, useMemo, useEffect, useCallback } from "react";

interface JobPanelProps {
  job: Job | null;
  jobs: Job[];
  onClose: () => void;
  userLocation: google.maps.LatLngLiteral | null;
  searchQuery: string;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  onJobClick: (job: Job) => void;
}

const distanceOptions = [5, 10, 25, 50, 100, 200, 300, 400, 500];
const jobTypeOptions = ["All Types", "Full Time", "Part Time", "Contract"];
const experienceLevelOptions = [
  "All Levels",
  "Internship",
  "Apprenticeship",
  "Entry Level",
  "Senior Level",
];

const JobPanel = ({
  jobs,
  onClose,
  userLocation,
  searchQuery,
  isMinimized,
  setIsMinimized,
  onJobClick,
}: JobPanelProps) => {
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState("All Types");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState("All Levels");
  const [dimensions, setDimensions] = useState({
    panelHeight: 0,
    minimizedHeight: 80,
    expandedOffset: 0,
  });

  useEffect(() => {
    setDimensions({
      panelHeight: window.innerHeight * 0.8,
      minimizedHeight: 80,
      expandedOffset: window.innerHeight * 0.2,
    });
  }, []);

  // Animation configuration
  const springConfig = {
    type: "spring",
    stiffness: 350,
    damping: 35,
    mass: 1,
  };

  // Panel animation variants
  const panelVariants = {
    minimized: {
      y: dimensions.panelHeight - dimensions.minimizedHeight,
      transition: springConfig,
    },
    expanded: {
      y: dimensions.expandedOffset,
      transition: springConfig,
    },
  };

  // Content animation variants
  const contentVariants = {
    minimized: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
    expanded: {
      opacity: 1,
      transition: { delay: 0.1, duration: 0.2 },
    },
  };

  // Enhanced filter handlers
  const handleFilterClick = (filterType: string) => {
    if (activeFilter === filterType) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterType);
    }
  };

  // Handle click on the drag handle
  const handleDragHandleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isDragging) {
        setIsMinimized(!isMinimized);
      }
    },
    [isDragging, isMinimized, setIsMinimized]
  );

  // Drag handlers
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);

    const dragThreshold = 50;
    const velocityThreshold = 500;

    if (isMinimized) {
      // When starting from minimized state
      if (
        info.velocity.y < -velocityThreshold ||
        info.offset.y < -dragThreshold
      ) {
        setIsMinimized(false);
      }
    } else {
      // When starting from expanded state
      if (
        info.velocity.y > velocityThreshold ||
        info.offset.y > dragThreshold
      ) {
        setIsMinimized(true);
        if (info.velocity.y > velocityThreshold * 1.5) {
          onClose();
        } else {
          setTimeout(onClose, 300);
        }
      }
    }
  };

  // Distance calculation and job grouping logic
  const groupedJobs = useMemo(() => {
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 3959;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let filteredJobs = jobs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.companyName.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
    }

    // Apply job type filter
    if (selectedJobType !== "All Types") {
      filteredJobs = filteredJobs.filter((job) => {
        const requirements = job.requirements.toLowerCase();
        switch (selectedJobType) {
          case "Part Time":
            return requirements.includes("part time");
          case "Contract":
            return requirements.includes("contract");
          case "Full Time":
            return (
              !requirements.includes("part time") &&
              !requirements.includes("contract")
            );
          default:
            return true;
        }
      });
    }

    // Apply experience level filter
    if (selectedExperience !== "All Levels") {
      filteredJobs = filteredJobs.filter((job) =>
        job.requirements
          .toLowerCase()
          .includes(selectedExperience.toLowerCase())
      );
    }

    // Group jobs by company first
    const grouped = filteredJobs.reduce((acc, job) => {
      let distance: number | null = null;
      if (userLocation && job.coordinates) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          job.coordinates.lat,
          job.coordinates.lng
        );
      }

      if (!acc[job.companyName]) {
        acc[job.companyName] = {
          jobs: [],
          distance: distance,
        };
      }

      acc[job.companyName].jobs.push(job);

      if (
        distance !== null &&
        (acc[job.companyName].distance === null ||
          distance < acc[job.companyName].distance!)
      ) {
        acc[job.companyName].distance = distance;
      }

      return acc;
    }, {} as Record<string, { jobs: Job[]; distance: number | null }>);

    // Apply distance filter after grouping
    if (selectedDistance !== null) {
      Object.keys(grouped).forEach((companyName) => {
        if (
          grouped[companyName].distance === null ||
          grouped[companyName].distance > selectedDistance
        ) {
          delete grouped[companyName];
        }
      });
    }

    return Object.entries(grouped).sort((a, b) => {
      if (a[1].distance === null) return 1;
      if (b[1].distance === null) return -1;
      return a[1].distance - b[1].distance;
    });
  }, [
    jobs,
    userLocation,
    searchQuery,
    selectedDistance,
    selectedJobType,
    selectedExperience,
  ]);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery && isMinimized) {
      setIsMinimized(false);
    }
  }, [searchQuery, isMinimized, setIsMinimized]);

  // Handle closing
  const handleClose = useCallback(() => {
    setIsMinimized(true);
    setTimeout(onClose, 300);
  }, [onClose, setIsMinimized]);

  return (
    <motion.div
      initial={false}
      animate={isMinimized ? "minimized" : "expanded"}
      variants={panelVariants}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-40"
      style={{ height: "80vh", touchAction: "none" }}
      drag="y"
      dragConstraints={{
        top: dimensions.expandedOffset,
        bottom: dimensions.panelHeight - dimensions.minimizedHeight,
      }}
      dragElastic={0.1}
      dragMomentum={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      dragTransition={{ bounceStiffness: 350, bounceDamping: 35 }}
    >
      {/* Drag Handle */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center bg-white rounded-t-xl"
        onClick={handleDragHandleClick}
      >
        <div className="w-16 h-1.5 bg-gray-300 rounded-full mt-4" />
      </motion.div>

      {/* Panel Content */}
      <motion.div
        variants={contentVariants}
        className="p-6 h-full flex flex-col pt-12 select-none"
      >
        {/* Header and Filters Section */}
        <div className="relative">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4">Jobs</h2>

            {/* Filter Pills - Centered */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => handleFilterClick("distance")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
                  activeFilter === "distance"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>
                  {selectedDistance ? `${selectedDistance} miles` : "Distance"}
                </span>
              </button>

              <button
                onClick={() => handleFilterClick("jobType")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
                  activeFilter === "jobType"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                }`}
              >
                <BriefcaseIcon className="h-5 w-5" />
                <span>{selectedJobType}</span>
              </button>

              <button
                onClick={() => handleFilterClick("experience")}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
                  activeFilter === "experience"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                }`}
              >
                <AcademicCapIcon className="h-5 w-5" />
                <span>{selectedExperience}</span>
              </button>
            </div>

            {/* Filter Dropdowns - Absolute positioned overlay */}
            <AnimatePresence>
              {activeFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mx-auto w-[90%] max-w-md z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-2"
                  style={{ top: "calc(100% + 8px)" }}
                >
                  {activeFilter === "distance" && (
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedDistance === null
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedDistance(null);
                          setActiveFilter(null);
                        }}
                      >
                        Any Distance
                      </button>
                      {distanceOptions.map((distance) => (
                        <button
                          key={distance}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            selectedDistance === distance
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedDistance(distance);
                            setActiveFilter(null);
                          }}
                        >
                          {distance} miles
                        </button>
                      ))}
                    </div>
                  )}

                  {activeFilter === "jobType" && (
                    <div className="grid grid-cols-2 gap-2">
                      {jobTypeOptions.map((type) => (
                        <button
                          key={type}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            selectedJobType === type
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedJobType(type);
                            setActiveFilter(null);
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeFilter === "experience" && (
                    <div className="grid grid-cols-2 gap-2">
                      {experienceLevelOptions.map((level) => (
                        <button
                          key={level}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            selectedExperience === level
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedExperience(level);
                            setActiveFilter(null);
                          }}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors bg-gray-50 shadow-sm border border-gray-200"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Job Cards */}
        <motion.div
          className="overflow-y-auto flex-1 -mx-6 px-6"
          variants={contentVariants}
        >
          {groupedJobs.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No jobs found matching your criteria
            </div>
          ) : (
            groupedJobs.map(([companyName, { jobs, distance }]) => (
              <JobCard
                key={companyName}
                companyName={companyName}
                jobs={jobs}
                distance={distance}
                onJobClick={onJobClick}
              />
            ))
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default JobPanel;
