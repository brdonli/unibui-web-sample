export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MapRef extends google.maps.Map {}
