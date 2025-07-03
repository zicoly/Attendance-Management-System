//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
} from "lucide-react";

interface Location {
  lat: number;
  lng: number;
}

interface Class {
  id: string;
  name: string;
  code: string;
  lecturerLocation: Location; // PRECISE LOCATION: Exact GPS coordinates where lecturer created the class
  radius: number; // GEOFENCE RADIUS: Distance in meters for attendance validation
  isActive: boolean;
  attendees: string[];
}

interface AttendanceRecord {
  studentId: string;
  classId: string;
  timestamp: Date;
  location: Location; // PRECISE LOCATION: Exact GPS coordinates where student marked attendance
  distance: number; // CALCULATED DISTANCE: Real distance between student and lecturer location
}

const AttendanceApp: React.FC = () => {
  const [userType, setUserType] = useState<"lecturer" | "student">("lecturer");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  // Google Maps reference
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  // Form states
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [radius, setRadius] = useState(50);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // PRECISE LOCATION CAPTURE: Get real GPS coordinates with high accuracy
  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      // HIGH ACCURACY GPS OPTIONS: Configure for maximum precision
      const options = {
        enableHighAccuracy: true, // Use GPS instead of network/wifi
        timeout: 10000,
        maximumAge: 0, // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude, // PRECISE LATITUDE: Real GPS coordinate
            lng: position.coords.longitude, // PRECISE LONGITUDE: Real GPS coordinate
          };
          resolve(location);
        },
        (error) => reject(error),
        options
      );
    });
  };

  // Initialize location on component mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const location = await getCurrentLocation();
        setCurrentLocation(location); // STORE PRECISE LOCATION: Save real GPS coordinates
        setLocationError("");
        console.log("PRECISE LOCATION CAPTURED:", location); // DEBUG: Show exact coordinates
      } catch (error) {
        setLocationError("Location access required for attendance system");
        console.error("LOCATION ERROR:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    initLocation();
  }, []);

  // Load Google Maps
  useEffect(() => {
    if (!currentLocation) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry`;
    script.async = true;
    script.onload = () => {
      if (mapRef.current && window.google) {
        map.current = new google.maps.Map(mapRef.current, {
          center: currentLocation, // CENTER ON PRECISE LOCATION: Use real GPS coordinates
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID,
        });

        updateMap();
      }
    };
    document.head.appendChild(script);
  }, [currentLocation, classes]);

  // Update map with markers and geofences
  const updateMap = () => {
    if (!map.current || !currentLocation) return;

    // Add current location marker
    new google.maps.Marker({
      position: currentLocation,
      map: map.current,
      title: "Your Location",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(
            '<svg width="20" height="20" viewBox="0 0 20 20" fill="blue" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8"/></svg>'
          ),
        scaledSize: new google.maps.Size(20, 20),
      },
    });

    // Add class markers and geofence circles
    classes.forEach((cls) => {
      // CLASS LOCATION MARKER: Show where lecturer created the class
      new google.maps.Marker({
        position: cls.lecturerLocation, // PRECISE CLASS LOCATION: Exact GPS coordinates
        map: map.current,
        title: `${cls.name} (${cls.code})`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>'
            ),
          scaledSize: new google.maps.Size(24, 24),
        },
      });

      // GEOFENCE CIRCLE: Visual representation of attendance boundary
      new google.maps.Circle({
        center: cls.lecturerLocation, // CENTER ON PRECISE CLASS LOCATION
        radius: cls.radius, // GEOFENCE RADIUS: Exact distance in meters
        map: map.current,
        fillColor: cls.isActive ? "#10B981" : "#EF4444",
        fillOpacity: 0.2,
        strokeColor: cls.isActive ? "#10B981" : "#EF4444",
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
    });
  };

  // DISTANCE CALCULATION: Precise calculation using Haversine formula
  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180; // CONVERT TO RADIANS: Latitude 1
    const φ2 = (loc2.lat * Math.PI) / 180; // CONVERT TO RADIANS: Latitude 2
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180; // LATITUDE DIFFERENCE
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180; // LONGITUDE DIFFERENCE

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // PRECISE DISTANCE: Return distance in meters
  };

  // Create class with precise location
  const createClass = async () => {
    if (!className || !classCode) return;

    try {
      // CAPTURE PRECISE LECTURER LOCATION: Get real GPS coordinates at class creation
      const lecturerLocation = await getCurrentLocation();
      console.log("LECTURER LOCATION CAPTURED:", lecturerLocation);

      const newClass: Class = {
        id: Date.now().toString(),
        name: className,
        code: classCode,
        lecturerLocation: lecturerLocation, // STORE PRECISE LOCATION: Exact GPS coordinates
        radius: radius, // GEOFENCE RADIUS: Distance in meters
        isActive: true,
        attendees: [],
      };

      setClasses([...classes, newClass]);
      setClassName("");
      setClassCode("");
    } catch (error) {
      alert("Failed to get precise location for class creation");
    }
  };

  // Mark attendance with location validation
  const markAttendance = async () => {
    if (!selectedClassId || !studentName || !studentId) return;

    try {
      // CAPTURE PRECISE STUDENT LOCATION: Get real GPS coordinates at attendance time
      const studentLocation = await getCurrentLocation();
      console.log("STUDENT LOCATION CAPTURED:", studentLocation);

      const selectedClass = classes.find((c) => c.id === selectedClassId);
      if (!selectedClass) return;

      // CALCULATE PRECISE DISTANCE: Between student and lecturer locations
      const distance = calculateDistance(
        studentLocation,
        selectedClass.lecturerLocation
      );
      console.log("DISTANCE CALCULATED:", distance, "meters");

      // GEOFENCE VALIDATION: Check if student is within allowed radius
      if (distance <= selectedClass.radius) {
        const newRecord: AttendanceRecord = {
          studentId: studentId,
          classId: selectedClassId,
          timestamp: new Date(),
          location: studentLocation, // STORE PRECISE STUDENT LOCATION
          distance: distance, // STORE CALCULATED DISTANCE
        };

        setAttendanceRecords([...attendanceRecords, newRecord]);

        // Update class attendees
        const updatedClasses = classes.map((c) =>
          c.id === selectedClassId
            ? { ...c, attendees: [...c.attendees, studentId] }
            : c
        );
        setClasses(updatedClasses);

        setStudentName("");
        setStudentId("");
        setSelectedClassId("");

        alert("Attendance marked successfully!");
      } else {
        alert(
          `You are ${distance.toFixed(1)}m away. Must be within ${selectedClass.radius}m.`
        );
      }
    } catch (error) {
      alert("Failed to get precise location for attendance");
    }
  };

  // GEOFENCE CHECK: Determine if student is within class boundary
  const isWithinGeofence = (classId: string): boolean => {
    if (!currentLocation) return false;
    const selectedClass = classes.find((c) => c.id === classId);
    if (!selectedClass) return false;

    // REAL-TIME DISTANCE CHECK: Calculate current distance to class location
    const distance = calculateDistance(
      currentLocation,
      selectedClass.lecturerLocation
    );
    return distance <= selectedClass.radius; // WITHIN GEOFENCE: True if within radius
  };

  const getDistanceToClass = (classId: string): number => {
    if (!currentLocation) return 0;
    const selectedClass = classes.find((c) => c.id === classId);
    if (!selectedClass) return 0;

    return calculateDistance(currentLocation, selectedClass.lecturerLocation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Geofenced Attendance System
          </h1>
          <p className="text-gray-600">
            Precise location-based attendance tracking
          </p>

          {locationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {locationError}
            </div>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setUserType("lecturer")}
              className={`px-6 py-3 rounded-md transition-colors ${
                userType === "lecturer"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <User className="inline w-4 h-4 mr-2" />
              Lecturer
            </button>
            <button
              onClick={() => setUserType("student")}
              className={`px-6 py-3 rounded-md transition-colors ${
                userType === "student"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="inline w-4 h-4 mr-2" />
              Student
            </button>
          </div>
        </div>

        {userType === "lecturer" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BookOpen className="mr-2 text-blue-600" />
                Create New Class
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Class Code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geofence Radius: {radius} meters
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* PRECISE LOCATION DISPLAY: Show exact GPS coordinates */}
              {currentLocation && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Precise Location: {currentLocation.lat.toFixed(6)},{" "}
                    {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <button
                onClick={createClass}
                disabled={
                  !className ||
                  !classCode ||
                  !currentLocation ||
                  isLoadingLocation
                }
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoadingLocation
                  ? "Getting Location..."
                  : "Create Class at Current Location"}
              </button>
            </div>

            {/* GOOGLE MAPS INTEGRATION: Visual representation of locations and geofences */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Location Map</h3>
              <div ref={mapRef} className="w-full h-96 rounded-lg border" />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">My Classes</h3>
              {classes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No classes created yet
                </p>
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-lg">
                        {cls.name} ({cls.code})
                      </h4>
                      <p className="text-sm text-gray-500">
                        Radius: {cls.radius}m | Attendees:{" "}
                        {cls.attendees.length}
                      </p>
                      {/* PRECISE LOCATION DETAILS: Show exact GPS coordinates */}
                      <p className="text-xs text-gray-600 mt-2">
                        Location: {cls.lecturerLocation.lat.toFixed(6)},{" "}
                        {cls.lecturerLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle className="mr-2 text-green-600" />
                Mark Attendance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">Select a Class</option>
                {classes
                  .filter((c) => c.isActive)
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                    </option>
                  ))}
              </select>

              {/* REAL-TIME GEOFENCE STATUS: Show current distance and validation */}
              {selectedClassId && currentLocation && (
                <div
                  className={`mb-4 p-4 rounded-lg border-2 ${
                    isWithinGeofence(selectedClassId)
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {isWithinGeofence(selectedClassId) ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span
                      className={`font-medium ${
                        isWithinGeofence(selectedClassId)
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {isWithinGeofence(selectedClassId)
                        ? "Within Geofence - Can Mark Attendance"
                        : "Outside Geofence - Cannot Mark Attendance"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Distance: {getDistanceToClass(selectedClassId).toFixed(1)}m
                  </p>
                </div>
              )}

              <button
                onClick={markAttendance}
                disabled={
                  !selectedClassId ||
                  !studentName ||
                  !studentId ||
                  !isWithinGeofence(selectedClassId)
                }
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Mark Attendance
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Class Locations</h3>
              <div ref={mapRef} className="w-full h-96 rounded-lg border" />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Available Classes</h3>
              {classes.filter((c) => c.isActive).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No active classes
                </p>
              ) : (
                <div className="space-y-4">
                  {classes
                    .filter((c) => c.isActive)
                    .map((cls) => (
                      <div
                        key={cls.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">
                              {cls.name} ({cls.code})
                            </h4>
                            <p className="text-sm text-gray-500">
                              Radius: {cls.radius}m | Distance:{" "}
                              {getDistanceToClass(cls.id).toFixed(1)}m
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              currentLocation && isWithinGeofence(cls.id)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {currentLocation && isWithinGeofence(cls.id)
                              ? "In Range"
                              : "Out of Range"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ATTENDANCE HISTORY: Show records with precise locations */}
            {attendanceRecords.filter((r) => r.studentId === studentId).length >
              0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">
                  My Attendance History
                </h3>
                <div className="space-y-3">
                  {attendanceRecords
                    .filter((record) => record.studentId === studentId)
                    .map((record, index) => {
                      const cls = classes.find((c) => c.id === record.classId);
                      return (
                        <div
                          key={index}
                          className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded"
                        >
                          <p className="font-medium">
                            {cls?.name || "Unknown Class"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {record.timestamp.toLocaleString()} | Distance:{" "}
                            {record.distance.toFixed(1)}m
                          </p>
                          <p className="text-xs text-gray-500">
                            Marked at: {record.location.lat.toFixed(6)},{" "}
                            {record.location.lng.toFixed(6)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CURRENT LOCATION STATUS */}
        {currentLocation && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MapPin className="mr-2 text-red-500" />
              Current Location Status
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Latitude:</strong> {currentLocation.lat.toFixed(8)}
              </p>
              <p>
                <strong>Longitude:</strong> {currentLocation.lng.toFixed(8)}
              </p>
              <p>
                <strong>Status:</strong> High Precision GPS
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceApp;
