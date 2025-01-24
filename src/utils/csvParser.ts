import Papa from "papaparse";
import { Job } from "@/types/job";

// Approximate coordinates for major cities with appropriate radiuses
const cityCoordinates: {
  [key: string]: { lat: number; lng: number; radius: number };
} = {
  // Northeast
  Boston: { lat: 42.3601, lng: -71.0589, radius: 0.015 },
  "New York": { lat: 40.7128, lng: -74.006, radius: 0.025 },
  Philadelphia: { lat: 39.9526, lng: -75.1652, radius: 0.02 },

  // Midwest
  Chicago: { lat: 41.8781, lng: -87.6298, radius: 0.02 },
  Cleveland: { lat: 41.4993, lng: -81.6944, radius: 0.015 },
  Columbus: { lat: 39.9612, lng: -82.9988, radius: 0.015 },
  Detroit: { lat: 42.3314, lng: -83.0458, radius: 0.015 },
  Indianapolis: { lat: 39.7684, lng: -86.1581, radius: 0.015 },
  "Kansas City": { lat: 39.0997, lng: -94.5786, radius: 0.015 },
  Milwaukee: { lat: 43.0389, lng: -87.9065, radius: 0.015 },

  // South
  Charlotte: { lat: 35.2271, lng: -80.8431, radius: 0.015 },
  Miami: { lat: 25.7617, lng: -80.1918, radius: 0.015 },
  Washington: { lat: 38.9072, lng: -77.0369, radius: 0.015 },

  // West
  Denver: { lat: 39.7392, lng: -104.9903, radius: 0.015 },
  Portland: { lat: 45.5155, lng: -122.6789, radius: 0.015 },
  "Salt Lake City": { lat: 40.7608, lng: -111.891, radius: 0.015 },
  Seattle: { lat: 47.6062, lng: -122.3321, radius: 0.02 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437, radius: 0.025 },
  "San Diego": { lat: 32.7157, lng: -117.1611, radius: 0.02 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398, radius: 0.015 },
  Dallas: { lat: 32.7767, lng: -96.797, radius: 0.02 },

  // Local Boston neighborhoods (keeping these for detail in Boston area)
  Cambridge: { lat: 42.3736, lng: -71.1097, radius: 0.01 },
  Somerville: { lat: 42.3876, lng: -71.0995, radius: 0.01 },
  Brookline: { lat: 42.3318, lng: -71.1212, radius: 0.01 },
  Newton: { lat: 42.337, lng: -71.2092, radius: 0.015 },
  Waltham: { lat: 42.3765, lng: -71.2356, radius: 0.01 },
  "Back Bay": { lat: 42.3503, lng: -71.081, radius: 0.005 },
  "South Boston": { lat: 42.3381, lng: -71.0476, radius: 0.008 },
  Seaport: { lat: 42.3519, lng: -71.0466, radius: 0.006 },
  Downtown: { lat: 42.3601, lng: -71.0589, radius: 0.007 },
};

const getRandomCoordInCity = (location: string) => {
  // Extract the city name from the location string (assuming format like "Boston, MA")
  const city = location.split(",")[0].trim();

  const cityData = cityCoordinates[city];
  if (!cityData) {
    // Default to Boston if city not found, but log a warning
    console.warn(`City not found: ${city}, defaulting to Boston coordinates`);
    const bostonData = cityCoordinates["Boston"];
    const radius = 0.015;
    const u = Math.random();
    const v = Math.random();
    const r = radius * Math.sqrt(-2 * Math.log(u));
    const theta = 2 * Math.PI * v;

    return {
      lat: bostonData.lat + r * Math.cos(theta),
      lng: bostonData.lng + r * Math.sin(theta),
    };
  }

  // Use a smaller radius for more realistic clustering
  const radius = cityData.radius;
  const u = Math.random();
  const v = Math.random();
  const r = radius * Math.sqrt(-2 * Math.log(u));
  const theta = 2 * Math.PI * v;

  return {
    lat: cityData.lat + r * Math.cos(theta),
    lng: cityData.lng + r * Math.sin(theta),
  };
};

type JobCSVRow = {
  Location: string;
  "Job Title": string;
  "Company Name": string;
  "Job Description": string;
  Requirements: string;
};

export const parseJobs = async (csvContent: string): Promise<Job[]> => {
  return new Promise((resolve, reject) => {
    if (!csvContent.trim()) {
      reject(new Error("CSV content is empty"));
      return;
    }

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parsing errors:", results.errors);
        }

        const jobs: Job[] = (results.data as JobCSVRow[])
          .map((row: JobCSVRow, index: number): Job | null => {
            try {
              if (!row["Location"]) {
                console.warn(`Missing location for job at index ${index}`);
                return null;
              }

              const coordinates = getRandomCoordInCity(row["Location"]);
              if (!coordinates) {
                console.warn(
                  `Failed to get coordinates for location: ${row["Location"]}`
                );
                return null;
              }

              return {
                id: `job-${index}-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                title: row["Job Title"] || "Unknown Title",
                companyName: row["Company Name"] || "Unknown Company",
                location: row["Location"],
                description: row["Job Description"] || "",
                requirements: row["Requirements"] || "",
                coordinates,
              };
            } catch (error) {
              console.error(`Error processing job at index ${index}:`, error);
              return null;
            }
          })
          .filter(
            (job): job is Job => job !== null && job.coordinates !== undefined
          );

        if (jobs.length === 0) {
          reject(new Error("No valid jobs found in the CSV data"));
          return;
        }

        console.log(`Parsed ${jobs.length} jobs with coordinates`);
        resolve(jobs);
      },
      error: (error: Error) => {
        console.error("CSV parsing error:", error);
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};
