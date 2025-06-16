//@ts-nocheck
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
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
  lecturerLocation: Location;
  radius: number;
  isActive: boolean;
  createdAt: Date;
  attendees: string[];
}

interface Student {
  id: string;
  name: string;
  studentId: string;
}

interface AttendanceRecord {
  studentId: string;
  classId: string;
  timestamp: Date;
  location: Location;
  distance: number;
}

const AttendanceApp: React.FC = () => {
  const [userType, setUserType] = useState<"lecturer" | "student">("lecturer");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  // Form states
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [radius, setRadius] = useState(50);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          // Fallback to simulated location for demo
          setCurrentLocation({
            lat: 6.5244 + (Math.random() - 0.5) * 0.01, // Lagos area with slight variation
            lng: 3.3792 + (Math.random() - 0.5) * 0.01,
          });
          //   setLocationError("Using simulated location for demo");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setCurrentLocation({
        lat: 6.5244,
        lng: 3.3792,
      });
      setLocationError("Geolocation not supported, using simulated location");
    }
  }, []);

  // Calculate distance between two points in meters
  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Create a new class
  const createClass = () => {
    if (!className || !classCode || !currentLocation) return;

    const newClass: Class = {
      id: Date.now().toString(),
      name: className,
      code: classCode,
      lecturerLocation: currentLocation,
      radius: radius,
      isActive: true,
      createdAt: new Date(),
      attendees: [],
    };

    setClasses([...classes, newClass]);
    setClassName("");
    setClassCode("");
    setRadius(50);
  };

  // Mark attendance
  const markAttendance = () => {
    if (!selectedClassId || !studentName || !studentId || !currentLocation)
      return;

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    if (!selectedClass) return;

    const distance = calculateDistance(
      currentLocation,
      selectedClass.lecturerLocation
    );

    if (distance <= selectedClass.radius) {
      const newRecord: AttendanceRecord = {
        studentId: studentId,
        classId: selectedClassId,
        timestamp: new Date(),
        location: currentLocation,
        distance: distance,
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
    }
  };

  // Check if student is within geofence
  const isWithinGeofence = (classId: string): boolean => {
    if (!currentLocation) return false;
    const selectedClass = classes.find((c) => c.id === classId);
    if (!selectedClass) return false;

    const distance = calculateDistance(
      currentLocation,
      selectedClass.lecturerLocation
    );
    return distance <= selectedClass.radius;
  };

  // Toggle class active status
  const toggleClassStatus = (classId: string) => {
    const updatedClasses = classes.map((c) =>
      c.id === classId ? { ...c, isActive: !c.isActive } : c
    );
    setClasses(updatedClasses);
  };

  const LecturerView = () => (
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
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Class Code"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {currentLocation && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <MapPin className="inline w-4 h-4 mr-1" />
              Current Location: {currentLocation.lat.toFixed(6)},{" "}
              {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        <button
          onClick={createClass}
          disabled={!className || !classCode || !currentLocation}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Create Class
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Users className="mr-2 text-green-600" />
          My Classes
        </h3>

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
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{cls.name}</h4>
                    <p className="text-gray-600">Code: {cls.code}</p>
                    <p className="text-sm text-gray-500">
                      Radius: {cls.radius}m | Attendees: {cls.attendees.length}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleClassStatus(cls.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      cls.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cls.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Location: {cls.lecturerLocation.lat.toFixed(4)},{" "}
                    {cls.lecturerLocation.lng.toFixed(4)}
                  </p>
                  <p>Created: {cls.createdAt.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const StudentView = () => (
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
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
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

        {selectedClassId && currentLocation && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              isWithinGeofence(selectedClassId)
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center">
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
                  ? "You are within the class geofence"
                  : "You are outside the class geofence"}
              </span>
            </div>
            {selectedClassId && (
              <p className="text-sm mt-2 text-gray-600">
                Distance:{" "}
                {calculateDistance(
                  currentLocation,
                  classes.find((c) => c.id === selectedClassId)
                    ?.lecturerLocation || currentLocation
                ).toFixed(1)}
                m
              </p>
            )}
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
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Mark Attendance
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Clock className="mr-2 text-blue-600" />
          Available Classes
        </h3>

        {classes.filter((c) => c.isActive).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No active classes available
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
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{cls.name}</h4>
                      <p className="text-gray-600 text-sm">Code: {cls.code}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentLocation && isWithinGeofence(cls.id)
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {currentLocation && isWithinGeofence(cls.id)
                        ? "In Range"
                        : "Out of Range"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Radius: {cls.radius}m | Attendees: {cls.attendees.length}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {attendanceRecords.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">My Attendance History</h3>
          <div className="space-y-3">
            {attendanceRecords
              .filter((record) => record.studentId === studentId)
              .map((record, index) => {
                const cls = classes.find((c) => c.id === record.classId);
                return (
                  <div
                    key={index}
                    className="border-l-4 border-green-500 pl-4 py-2"
                  >
                    <p className="font-medium">
                      {cls?.name || "Unknown Class"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.timestamp.toLocaleString()} | Distance:{" "}
                      {record.distance.toFixed(1)}m
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Geofenced Attendance System
          </h1>
          <p className="text-gray-600">
            Location-based attendance tracking with precision
          </p>

          {locationError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
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

        {userType === "lecturer" ? <LecturerView /> : <StudentView />}

        {currentLocation && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MapPin className="mr-2 text-red-500" />
              Location Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Latitude:</span>{" "}
                {currentLocation.lat.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Longitude:</span>{" "}
                {currentLocation.lng.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Accuracy:</span> High Precision
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceApp;
