import {
  BookOpen,
  Clock,
  Users,
  User,
  AlertCircle,
  CheckCircle,
  Timer,
  Navigation,
  Wifi,
  Smartphone,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";

export default function ClassCard({
  classData,
  onMarkAttendance,
  studentInfo = {},
}: any) {
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [userLocation, setUserLocation] = useState<any>(null);
  const [distanceToClass, setDistanceToClass] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [localAttendedClasses, setLocalAttendedClasses] = useState<any>([]);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  const allowedRadius = classData.geofence?.radius || 100;
  const classLocation = {
    lat: classData.geofence?.latitude,
    lng: classData.geofence?.longitude,
  };

  // Enhanced Haversine formula with higher precision
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000; // Earth's radius in meters (more precise)
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },
    []
  );

  // Detect connection type
  const detectConnectionType = useCallback(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(
        connection.effectiveType || connection.type || "unknown"
      );
    } else {
      setConnectionType("unknown");
    }
  }, []);

  // Enhanced location options for maximum accuracy
  const getLocationOptions = useCallback(() => {
    return {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 0, // Always get fresh location
    };
  }, []);

  // Get user's current location with extremely high accuracy
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setIsTrackingLocation(true);
    detectConnectionType();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          timestamp: new Date().toISOString(),
        });
        setLocationAccuracy(accuracy);
        setLocationError(null);
        setIsTrackingLocation(false);
        setLocationUpdateCount((prev) => prev + 1);

        if (classLocation.lat && classLocation.lng) {
          const distance = calculateDistance(
            latitude,
            longitude,
            classLocation.lat,
            classLocation.lng
          );
          setDistanceToClass(Math.round(distance * 100) / 100); // Round to 2 decimal places
        }
      },
      (error) => {
        setIsTrackingLocation(false);
        let errorMsg = "Location access denied";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg =
              "Location permission denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location unavailable. Please check your GPS/WiFi.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out. Retrying...";
            break;
          default:
            errorMsg = "Unknown location error occurred.";
        }

        setLocationError(errorMsg);
        console.error("Location error:", error);
      },
      getLocationOptions()
    );
  }, [
    calculateDistance,
    classLocation.lat,
    classLocation.lng,
    getLocationOptions,
    detectConnectionType,
  ]);

  // Watch position for continuous updates
  const watchUserLocation = useCallback(() => {
    if (!navigator.geolocation || !classData.locationRequired) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          timestamp: new Date().toISOString(),
        });
        setLocationAccuracy(accuracy);
        setLocationError(null);
        setLocationUpdateCount((prev) => prev + 1);

        if (classLocation.lat && classLocation.lng) {
          const distance = calculateDistance(
            latitude,
            longitude,
            classLocation.lat,
            classLocation.lng
          );
          setDistanceToClass(Math.round(distance * 100) / 100);
        }
      },
      (error) => {
        console.error("Watch position error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000, // Very fresh updates
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [
    calculateDistance,
    classLocation.lat,
    classLocation.lng,
    classData.locationRequired,
  ]);

  // Initialize location tracking
  useEffect(() => {
    if (classData.locationRequired && classLocation.lat && classLocation.lng) {
      getUserLocation();
      const cleanup = watchUserLocation();

      // Also update every 2 seconds for real-time tracking
      const interval = setInterval(() => {
        getUserLocation();
      }, 2000);

      return () => {
        if (cleanup) cleanup();
        clearInterval(interval);
      };
    }
  }, [
    classData.locationRequired,
    classLocation.lat,
    classLocation.lng,
    getUserLocation,
    watchUserLocation,
  ]);

  const hasMarkedAttendance = useMemo(() => {
    return localAttendedClasses.some(
      (attendedClass: any) =>
        attendedClass.id === classData.id &&
        attendedClass.studentId === studentInfo.studentId
    );
  }, [localAttendedClasses, classData.id, studentInfo.studentId]);

  const isClassExpired = () => {
    if (!classData.createdAt || !classData.duration) return false;
    const startTime = new Date(classData.createdAt);
    const currentTime = new Date();
    const durationInMs = classData.duration * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationInMs);
    return currentTime > endTime;
  };

  const getTimeRemaining = () => {
    if (!classData.createdAt || !classData.duration) return null;
    const startTime = new Date(classData.createdAt);
    const currentTime: any = new Date();
    const durationInMs = classData.duration * 60 * 1000;
    const endTime: any = new Date(startTime.getTime() + durationInMs);
    const timeLeft = endTime - currentTime;

    if (timeLeft <= 0) return "Expired";
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const isWithinGeofence = () => {
    if (!classData.locationRequired) return true;
    if (!userLocation || !classLocation.lat || !classLocation.lng) return false;

    // Consider location accuracy in the calculation
    const effectiveRadius = allowedRadius + (locationAccuracy || 0);
    return distanceToClass !== null && distanceToClass <= effectiveRadius;
  };

  const getLocationStatus = () => {
    if (!classData.locationRequired)
      return { status: "Not Required", color: "gray" };
    if (!userLocation)
      return { status: "Getting Location...", color: "yellow" };
    if (locationError) return { status: "Location Error", color: "red" };

    const withinGeofence = isWithinGeofence();
    const accuracyText = locationAccuracy
      ? `±${Math.round(locationAccuracy)}m`
      : "";

    return {
      status: withinGeofence
        ? `✅ In Range ${accuracyText}`
        : `❌ Out of Range ${accuracyText}`,
      color: withinGeofence ? "green" : "red",
    };
  };

  const handleMarkAttendance = async () => {
    if (isClassExpired()) {
      setAttendanceStatus({
        type: "error",
        message: "Class time has expired. You cannot mark attendance.",
      });
      return;
    }

    if (hasMarkedAttendance) {
      setAttendanceStatus({
        type: "error",
        message: "You have already marked attendance for this class",
      });
      return;
    }

    // Get fresh location before checking
    if (classData.locationRequired) {
      await new Promise<void>((resolve) => {
        getUserLocation();
        setTimeout(resolve, 2000); // Wait for location update
      });
    }

    if (classData.locationRequired && !isWithinGeofence()) {
      setAttendanceStatus({
        type: "error",
        message: `You must be within ${allowedRadius}m of the class location. Current distance: ${distanceToClass?.toFixed(2)}m (Accuracy: ±${locationAccuracy?.toFixed(0)}m)`,
      });
      return;
    }

    setShowCodeInput(true);
    setAttendanceStatus(null);
  };

  const handleCodeSubmit = async () => {
    if (!classCode.trim()) {
      setAttendanceStatus({
        type: "error",
        message: "Please enter the class code",
      });
      return;
    }

    if (classCode.toUpperCase() !== classData.code.toUpperCase()) {
      setAttendanceStatus({
        type: "error",
        message: "Invalid class code. Please try again.",
      });
      return;
    }

    // Final location check before marking attendance
    if (classData.locationRequired && !isWithinGeofence()) {
      setAttendanceStatus({
        type: "error",
        message: `Location check failed. You must be within ${allowedRadius}m of the class. Current distance: ${distanceToClass?.toFixed(2)}m`,
      });
      return;
    }

    setIsMarking(true);
    setAttendanceStatus(null);

    try {
      await onMarkAttendance(classData, {
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: studentInfo.email,
        level: studentInfo.level,
        phone: studentInfo.phone,
        studentId: studentInfo.studentId,
        location: userLocation,
        distanceFromClass: distanceToClass,
        locationAccuracy: locationAccuracy,
        connectionType: connectionType,
      });

      const newAttendedClass = {
        id: classData.id,
        studentId: studentInfo.studentId,
        classTitle: classData.title,
        classCode: classData.code,
        markedAt: new Date().toISOString(),
        lecturerName: classData.lecturerName,
        lecturerlastName: classData.lecturerlastName,
        location: userLocation,
        distanceFromClass: distanceToClass,
        locationAccuracy: locationAccuracy,
      };

      const updatedAttendedClasses = [
        ...localAttendedClasses,
        newAttendedClass,
      ];
      setLocalAttendedClasses(updatedAttendedClasses);

      setAttendanceStatus({
        type: "success",
        message: "Attendance marked successfully!",
      });
      setShowCodeInput(false);
      setClassCode("");
    } catch (error: any) {
      setAttendanceStatus({
        type: "error",
        message: error.message || "Failed to mark attendance",
      });
    } finally {
      setIsMarking(false);
      setTimeout(() => setAttendanceStatus(null), 3000);
    }
  };

  // Calculate position for visual representation
  const calculateVisualPosition = () => {
    if (!distanceToClass || !allowedRadius) return { x: 50, y: 50 };

    const maxVisualDistance = 50; // Maximum pixels from center
    const distanceRatio = Math.min(distanceToClass / allowedRadius, 2);
    const visualDistance = (distanceRatio * maxVisualDistance) / 2;

    // Random angle for demonstration (in real app, you'd use actual bearing)
    const angle = (Date.now() / 1000) % (2 * Math.PI);
    const x = 50 + Math.cos(angle) * visualDistance;
    const y = 50 + Math.sin(angle) * visualDistance;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const classExpired = isClassExpired();
  const timeRemaining = getTimeRemaining();
  const withinGeofence = isWithinGeofence();
  const locationStatus = getLocationStatus();
  const visualPosition = calculateVisualPosition();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">{classData.title}</h3>
            <p className="text-sm text-gray-500">Code: {classData.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              classExpired
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {classExpired ? "Expired" : "Active"}
          </span>
          {hasMarkedAttendance && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Attended
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <span className="text-sm">
            Dr. {classData.lecturerlastName} {classData.lecturerName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Started{" "}
            {new Date(classData.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {timeRemaining && (
          <div
            className={`flex items-center gap-2 ${classExpired ? "text-red-600" : "text-orange-600"}`}
          >
            <Timer className="w-4 h-4" />
            <span className="text-sm font-medium">
              {classExpired
                ? "Time expired"
                : `Time remaining: ${timeRemaining}`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {classData.attendees?.length || 0} students
          </span>
        </div>
      </div>

      {/* Enhanced Location Status */}
      {classData.locationRequired && (
        <div className="mb-4">
          <div
            className={`p-3 rounded-lg border ${
              locationStatus.color === "green"
                ? "bg-green-50 border-green-200"
                : locationStatus.color === "red"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                {isTrackingLocation && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-sm font-medium">
                {locationStatus.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {distanceToClass !== null && (
                <div>
                  <strong>Distance:</strong> {distanceToClass.toFixed(2)}m
                </div>
              )}
              <div>
                <strong>Max:</strong> {allowedRadius}m
              </div>
              {locationAccuracy && (
                <div>
                  <strong>Accuracy:</strong> ±{Math.round(locationAccuracy)}m
                </div>
              )}
              <div className="flex items-center gap-1">
                <strong>Connection:</strong>
                {connectionType === "wifi" ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <Smartphone className="w-3 h-3" />
                )}
                <span className="capitalize">{connectionType}</span>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              Updates: {locationUpdateCount} | Last:{" "}
              {userLocation?.timestamp
                ? new Date(userLocation.timestamp).toLocaleTimeString()
                : "Never"}
            </div>

            {locationError && (
              <div className="mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="text-xs text-red-600">{locationError}</p>
              </div>
            )}
          </div>

          {/* Enhanced Visual Geofence */}
          {userLocation && classLocation.lat && classLocation.lng && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden">
                {/* Geofence circle */}
                <div
                  className="absolute border-2 border-blue-500 rounded-full opacity-30 bg-blue-200"
                  style={{
                    width: "60px",
                    height: "60px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* Lecturer location (center) */}
                <div
                  className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  title="Lecturer Location"
                />

                {/* Student location (moving) */}
                <div
                  className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
                    withinGeofence ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{
                    top: `${visualPosition.y}%`,
                    left: `${visualPosition.x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  title={`Your Location - ${distanceToClass?.toFixed(2)}m away`}
                />

                {/* Accuracy indicator */}
                {locationAccuracy && (
                  <div
                    className="absolute border border-gray-400 rounded-full opacity-20 bg-gray-300"
                    style={{
                      width: `${Math.min(locationAccuracy * 0.5, 30)}px`,
                      height: `${Math.min(locationAccuracy * 0.5, 30)}px`,
                      top: `${visualPosition.y}%`,
                      left: `${visualPosition.x}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
              </div>

              <div className="mt-2 text-xs text-center text-gray-600">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Lecturer</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded-full ${withinGeofence ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span>You ({distanceToClass?.toFixed(1)}m)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-200"></div>
                    <span>Allowed ({allowedRadius}m)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {attendanceStatus && (
        <div
          className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
            attendanceStatus.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {attendanceStatus.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <p className="text-sm">{attendanceStatus.message}</p>
        </div>
      )}

      {/* Class Code Input */}
      {showCodeInput && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Enter Class Code
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter class code..."
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isMarking}
            />
            <button
              onClick={handleCodeSubmit}
              disabled={isMarking}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm font-medium"
            >
              {isMarking ? "..." : "Submit"}
            </button>
            <button
              onClick={() => {
                setShowCodeInput(false);
                setClassCode("");
                setAttendanceStatus(null);
              }}
              disabled={isMarking}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleMarkAttendance}
        disabled={
          classExpired ||
          hasMarkedAttendance ||
          (classData.locationRequired && !withinGeofence)
        }
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          classExpired ||
          hasMarkedAttendance ||
          (classData.locationRequired && !withinGeofence)
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {hasMarkedAttendance
          ? "Attendance Already Marked"
          : classExpired
            ? "Class Expired"
            : classData.locationRequired && !withinGeofence
              ? `Move closer (${distanceToClass?.toFixed(1)}m away)`
              : "Mark Attendance"}
      </button>
    </div>
  );
}
