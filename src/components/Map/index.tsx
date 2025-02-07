"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import CustomMarker from "./CustomMarker";
import { Job } from "@/types/job";
import { parseJobs } from "@/utils/csvParser";
import supercluster from "supercluster";
import JobPanel from "@/components/Jobs/JobPanel";
import SearchBar from "@/components/Jobs/SearchBar";
import JobDetailPage from "@/components/Jobs/JobDetail";

const defaultCenter = {
  lat: 39.8283, // Center of US
  lng: -98.5795,
};

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  minZoom: 2, // Prevent zooming out too far
  maxZoom: 18,
  restriction: {
    latLngBounds: {
      north: 85, // Maximum north latitude
      south: -85, // Maximum south latitude
      west: -180, // Maximum west longitude
      east: 180, // Maximum east longitude
    },
    strictBounds: true, // Prevents scrolling outside bounds
  },
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

type Cluster = {
  type: "Feature";
  id: string | number; // Changed to allow string or number
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    jobId?: string;
    job?: Job;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

const MapComponent = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [initialZoom, setInitialZoom] = useState(4); // Default zoom for US view
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [index, setIndex] = useState<supercluster | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJobPanelMinimized, setIsJobPanelMinimized] = useState(true);
  const [selectedCompanyJobs, setSelectedCompanyJobs] = useState<Job[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/data/jobs.csv");
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        }
        const text = await response.text();
        const parsedJobs = await parseJobs(text);
        setJobs(parsedJobs);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load jobs"
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setInitialZoom(12); // Zoom in closer when we have user location

          // If map exists, pan to user location
          if (map) {
            map.panTo(userPos);
            map.setZoom(12);
          }
        },
        (error) => {
          console.log("Geolocation error or denied:", error);
          // Keep default US view if geolocation fails
        }
      );
    }
  }, [map]);

  useEffect(() => {
    if (!map || !bounds || !jobs.length) return;

    const newIndex = new supercluster({
      radius: 40,
      maxZoom: 16,
      minPoints: 2,
    });

    const points = jobs.map((job) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        jobId: job.id,
        job,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [job.coordinates?.lng || 0, job.coordinates?.lat || 0],
      },
    }));

    newIndex.load(points);
    setIndex(newIndex);

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const newClusters = newIndex.getClusters(
      [sw.lng(), sw.lat(), ne.lng(), ne.lat()],
      Math.floor(initialZoom)
    ) as unknown as Cluster[];

    setClusters(newClusters);
  }, [map, bounds, jobs, initialZoom]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);
      const bounds = new google.maps.LatLngBounds();

      // If we have jobs, extend bounds to include all job locations
      if (jobs.length > 0) {
        jobs.forEach((job) => {
          if (job.coordinates) {
            bounds.extend(job.coordinates);
          }
        });
        map.fitBounds(bounds);
      }

      setBounds(bounds);
    },
    [jobs]
  );

  const onBoundsChanged = () => {
    if (!map) return;
    const newBounds = map.getBounds();
    if (newBounds) {
      setBounds(newBounds);
      setInitialZoom(map.getZoom() || 12);
    }
  };

  const handleMapClick = useCallback(() => {
    setSelectedJob(null);
    setIsJobPanelMinimized(true);
  }, [setIsJobPanelMinimized]);

  const handleJobClick = useCallback(
    (clickedJob: Job) => {
      const companyJobs = jobs.filter(
        (job) => job.companyName === clickedJob.companyName
      );
      setSelectedCompanyJobs(companyJobs);
    },
    [jobs]
  );

  // Add the back handler:
  const handleBackFromDetail = useCallback(() => {
    setSelectedCompanyJobs(null);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <SearchBar
        onSearch={setSearchQuery}
        onFocus={() => setIsJobPanelMinimized(false)}
      />
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={initialZoom}
          options={options}
          onLoad={onMapLoad}
          onBoundsChanged={onBoundsChanged}
          onClick={handleMapClick}
        >
          {/* Render user location marker if available */}
          {userLocation && (
            <CustomMarker
              position={userLocation}
              isUserLocation={true} // We'll add this prop to CustomMarker
            />
          )}

          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const position = { lat: latitude, lng: longitude };

            if (cluster.properties.cluster) {
              return (
                <CustomMarker
                  key={`cluster-${cluster.id}`}
                  position={position}
                  count={cluster.properties.point_count}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      index?.getClusterExpansionZoom(Number(cluster.id)) || 20,
                      20
                    );
                    map?.setZoom(expansionZoom);
                    map?.panTo(position);
                  }}
                />
              );
            }

            return (
              <CustomMarker
                key={cluster.properties.jobId}
                position={position}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedJob(cluster.properties.job || null);
                }}
              />
            );
          })}
        </GoogleMap>
      </LoadScript>

      <JobPanel
        job={selectedJob}
        jobs={jobs}
        onClose={() => setIsJobPanelMinimized(true)}
        userLocation={userLocation}
        searchQuery={searchQuery}
        isMinimized={isJobPanelMinimized}
        setIsMinimized={setIsJobPanelMinimized}
        onJobClick={handleJobClick}
      />

      <AnimatePresence mode="wait">
        {selectedCompanyJobs && (
          <JobDetailPage
            companyJobs={selectedCompanyJobs}
            onBack={handleBackFromDetail}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MapComponent;
