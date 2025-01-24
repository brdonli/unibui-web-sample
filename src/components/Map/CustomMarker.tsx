import { memo } from "react";
import { OverlayView } from "@react-google-maps/api";

interface CustomMarkerProps {
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  count?: number;
  onClick?: (e: React.MouseEvent) => void;
  isUserLocation?: boolean;
}

const CustomMarker = memo(
  ({ position, count, onClick, isUserLocation }: CustomMarkerProps) => {
    return (
      <OverlayView
        position={position}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          className={`
          ${
            isUserLocation
              ? "bg-red-500 border-2 border-white"
              : count
              ? "bg-blue-500"
              : "bg-blue-500 border-2 border-white"
          }
          rounded-full cursor-pointer transform hover:scale-110 transition-transform
          flex items-center justify-center text-white font-bold shadow-lg
          ${isUserLocation ? "w-4 h-4" : count ? "w-8 h-8" : "w-6 h-6"}
          ${isUserLocation ? "ring-4 ring-red-200" : ""}
        `}
          onClick={(e) => onClick?.(e)}
        >
          {count ? count : ""}
        </div>
      </OverlayView>
    );
  }
);

CustomMarker.displayName = "CustomMarker";
export default CustomMarker;
