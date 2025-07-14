// import {
//   BookOpen,
//   MapPin,
//   Clock,
//   Users,
//   User,
//   AlertCircle,
//   CheckCircle,
//   Timer,
// } from "lucide-react";
// import { useMemo, useState } from "react";

// export default function ClassCard({
//   classData,
//   onMarkAttendance,
//   // attendedClasses = [],
//   studentInfo = {},
// }: any) {
//   const [isMarking, setIsMarking] = useState(false);
//   const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
//   const [showCodeInput, setShowCodeInput] = useState(false);
//   const [classCode, setClassCode] = useState("");
//   const [localAttendedClasses, setLocalAttendedClasses] = useState(() => {
//     return JSON.parse(localStorage.getItem("studentAttendedClasses") || "[]");
//   });

//   // Check if current user has already marked attendance
//   const hasMarkedAttendance = useMemo(() => {
//     return localAttendedClasses.some(
//       (attendedClass: any) =>
//         attendedClass.id === classData.id &&
//         attendedClass.studentId === studentInfo.studentId
//     );
//   }, [localAttendedClasses, classData.id, studentInfo.studentId]);

//   // Check if class timer has expired
//   const isClassExpired = () => {
//     if (!classData.createdAt || !classData.duration) return false;

//     const startTime = new Date(classData.createdAt);
//     const currentTime = new Date();
//     const durationInMs = classData.duration * 60 * 1000; // Convert minutes to milliseconds
//     const endTime = new Date(startTime.getTime() + durationInMs);

//     return currentTime > endTime;
//   };

//   const getTimeRemaining = () => {
//     if (!classData.createdAt || !classData.duration) return null;

//     const startTime = new Date(classData.createdAt);
//     const currentTime: any = new Date();
//     const durationInMs = classData.duration * 60 * 1000;
//     const endTime: any = new Date(startTime.getTime() + durationInMs);
//     const timeLeft = endTime - currentTime;

//     if (timeLeft <= 0) return "Expired";

//     const minutes = Math.floor(timeLeft / (1000 * 60));
//     const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

//     return `${minutes}m ${seconds}s`;
//   };

//   const formatTime = (timestamp: any) => {
//     if (!timestamp) return "Unknown";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   const isLocationRequired =
//     classData.locationRequired && classData.geofence?.enabled;

//   const handleMarkAttendance = async () => {
//     // Check if class has expired
//     if (isClassExpired()) {
//       setAttendanceStatus({
//         type: "error",
//         message: "Class time has expired. You cannot mark attendance.",
//       });
//       return;
//     }

//     // Check if user has already marked attendance (from local storage)
//     if (hasMarkedAttendance) {
//       setAttendanceStatus({
//         type: "error",
//         message: "You have already marked attendance for this class",
//       });
//       return;
//     }

//     // Show code input instead of directly marking attendance
//     setShowCodeInput(true);
//     setAttendanceStatus(null);
//   };

//   const handleCodeSubmit = async () => {
//     if (!classCode.trim()) {
//       setAttendanceStatus({
//         type: "error",
//         message: "Please enter the class code",
//       });
//       return;
//     }

//     // Verify class code
//     if (classCode.toUpperCase() !== classData.code.toUpperCase()) {
//       setAttendanceStatus({
//         type: "error",
//         message: "Invalid class code. Please try again.",
//       });
//       return;
//     }

//     setIsMarking(true);
//     setAttendanceStatus(null);

//     try {
//       // Call the parent's attendance marking function with student info
//       await onMarkAttendance(classData, {
//         firstName: studentInfo.firstName,
//         lastName: studentInfo.lastName,
//         email: studentInfo.email,
//         level: studentInfo.level,
//         phone: studentInfo.phone,
//         studentId: studentInfo.studentId,
//       });

//       // Update local storage after successful attendance marking
//       const newAttendedClass = {
//         id: classData.id,
//         studentId: studentInfo.studentId,
//         classTitle: classData.title,
//         classCode: classData.code,
//         markedAt: new Date().toISOString(),
//         lecturerName: classData.lecturerName,
//         lecturerlastName: classData.lecturerlastName,
//       };

//       const updatedAttendedClasses = [
//         ...localAttendedClasses,
//         newAttendedClass,
//       ];
//       localStorage.setItem(
//         "studentAttendedClasses",
//         JSON.stringify(updatedAttendedClasses)
//       );
//       setLocalAttendedClasses(updatedAttendedClasses);

//       setAttendanceStatus({
//         type: "success",
//         message: "Attendance marked successfully!",
//       });
//       setShowCodeInput(false);
//       setClassCode("");
//     } catch (error: any) {
//       setAttendanceStatus({
//         type: "error",
//         message: error.message || "Failed to mark attendance",
//       });
//     } finally {
//       setIsMarking(false);
//       // Clear status after 3 seconds
//       setTimeout(() => setAttendanceStatus(null), 3000);
//     }
//   };

//   const handleCancelCode = () => {
//     setShowCodeInput(false);
//     setClassCode("");
//     setAttendanceStatus(null);
//   };

//   const classExpired = isClassExpired();
//   const timeRemaining = getTimeRemaining();

//   return (
//     <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
//             <BookOpen className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h3 className="font-bold text-gray-900">{classData.title}</h3>
//             <p className="text-sm text-gray-500">Code: {classData.code}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <span
//             className={`px-3 py-1 rounded-full text-sm font-medium ${
//               classExpired
//                 ? "bg-red-100 text-red-800"
//                 : "bg-green-100 text-green-800"
//             }`}
//           >
//             {classExpired ? "Expired" : "Active"}
//           </span>
//           {hasMarkedAttendance && (
//             <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//               Attended
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="space-y-2 mb-4">
//         <div className="flex items-center gap-2 text-gray-600">
//           <User className="w-4 h-4" />
//           <span className="text-sm">
//             Dr. {classData.lecturerlastName} {classData.lecturerName}
//           </span>
//         </div>

//         <div className="flex items-center gap-2 text-gray-600">
//           <Clock className="w-4 h-4" />
//           <span className="text-sm">
//             Started {formatTime(classData.createdAt || classData.startTime)}
//           </span>
//         </div>

//         {/* Time remaining display */}
//         {timeRemaining && (
//           <div
//             className={`flex items-center gap-2 ${
//               classExpired ? "text-red-600" : "text-orange-600"
//             }`}
//           >
//             <Timer className="w-4 h-4" />
//             <span className="text-sm font-medium">
//               {classExpired
//                 ? "Time expired"
//                 : `Time remaining: ${timeRemaining}`}
//             </span>
//           </div>
//         )}

//         {isLocationRequired && (
//           <div className="flex items-center gap-2 text-gray-600">
//             <MapPin className="w-4 h-4" />
//             <span className="text-sm text-ellipsis overflow-hidden">
//               Lead City University, latitude: {classData.geofence?.latitude}{" "}
//               longitude: {classData.geofence?.longitude}
//             </span>
//           </div>
//         )}

//         <div className="flex items-center gap-2 text-gray-600">
//           <Users className="w-4 h-4" />
//           <span className="text-sm">
//             {classData.attendees?.length || classData.attendanceCount || 0}{" "}
//             students
//           </span>
//         </div>
//       </div>

//       {(isLocationRequired || classData.locationRequired) && (
//         <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
//           <p className="text-sm text-amber-800 font-medium">
//             📍 Location Required
//           </p>
//           <p className="text-xs text-amber-700 mt-1">
//             You must be within{" "}
//             {classData.allowedRadius || classData.geofence?.radius || 100}m of
//             the class location
//           </p>
//         </div>
//       )}

//       {attendanceStatus && (
//         <div
//           className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
//             attendanceStatus.type === "success"
//               ? "bg-green-50 border-green-200 text-green-800"
//               : "bg-red-50 border-red-200 text-red-800"
//           }`}
//         >
//           {attendanceStatus.type === "success" ? (
//             <CheckCircle className="w-4 h-4" />
//           ) : (
//             <AlertCircle className="w-4 h-4" />
//           )}
//           <p className="text-sm">{attendanceStatus.message}</p>
//         </div>
//       )}

//       {/* Class code input */}
//       {showCodeInput && (
//         <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//           <p className="text-sm text-blue-800 font-medium mb-2">
//             Enter Class Code
//           </p>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={classCode}
//               onChange={(e) => setClassCode(e.target.value)}
//               placeholder="Enter class code..."
//               className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//               disabled={isMarking}
//             />
//             <button
//               onClick={handleCodeSubmit}
//               disabled={isMarking}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm font-medium"
//             >
//               {isMarking ? "..." : "Submit"}
//             </button>
//             <button
//               onClick={handleCancelCode}
//               disabled={isMarking}
//               className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 text-sm font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       <button
//         onClick={handleMarkAttendance}
//         disabled={classExpired || hasMarkedAttendance}
//         className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
//           classExpired || hasMarkedAttendance
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//       >
//         {hasMarkedAttendance
//           ? "Attendance Already Marked"
//           : classExpired
//             ? "Class Expired"
//             : "Mark Attendance"}
//       </button>
//     </div>
//   );
// }
//@ts-nocheck
import {
  BookOpen,
  MapPin,
  Clock,
  Users,
  User,
  AlertCircle,
  CheckCircle,
  Timer,
  Navigation,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

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
  const [localAttendedClasses, setLocalAttendedClasses] = useState([]);

  const allowedRadius = classData.geofence?.radius || 5; // Default 5m
  const classLocation = {
    lat: classData.geofence?.latitude,
    lng: classData.geofence?.longitude,
  };

  // Calculate distance between two GPS coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get user's current location with high accuracy
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationError(null);

        if (classLocation.lat && classLocation.lng) {
          const distance = calculateDistance(
            latitude,
            longitude,
            classLocation.lat,
            classLocation.lng
          );
          setDistanceToClass(Math.round(distance));
        }
      },
      (error) => {
        setLocationError("Location access denied");
        console.error("Location error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Update location every 5 seconds when component mounts
  useEffect(() => {
    if (classData.locationRequired && classLocation.lat && classLocation.lng) {
      getUserLocation();
      const interval = setInterval(getUserLocation, 5000);
      return () => clearInterval(interval);
    }
  }, [classData.locationRequired, classLocation.lat, classLocation.lng]);

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
    return distanceToClass !== null && distanceToClass <= allowedRadius;
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

    // Check location if required
    if (classData.locationRequired && !isWithinGeofence()) {
      setAttendanceStatus({
        type: "error",
        message: `You must be within ${allowedRadius}m of the class location. Current distance: ${distanceToClass}m`,
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
        message: `Location check failed. You must be within ${allowedRadius}m of the class.`,
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
        location: userLocation, // Include location in attendance record
        distanceFromClass: distanceToClass,
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

  const classExpired = isClassExpired();
  const timeRemaining = getTimeRemaining();
  const withinGeofence = isWithinGeofence();

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

      {/* Location Status */}
      {classData.locationRequired && (
        <div className="mb-4">
          <div
            className={`p-3 rounded-lg border ${
              withinGeofence
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-medium">
                Location Status:{" "}
                {withinGeofence ? "✅ In Range" : "❌ Out of Range"}
              </span>
            </div>

            {distanceToClass !== null && (
              <p className="text-xs">
                Distance: {distanceToClass}m (Max: {allowedRadius}m)
              </p>
            )}

            {locationError && (
              <p className="text-xs text-red-600 mt-1">{locationError}</p>
            )}
          </div>

          {/* Visual Geofence Circle */}
          {userLocation && classLocation.lat && classLocation.lng && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="absolute bg-blue-300 rounded-full opacity-30 border-2 border-blue-500"
                  style={{
                    width: `${Math.min(allowedRadius * 2, 60)}px`,
                    height: `${Math.min(allowedRadius * 2, 60)}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-red-500 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  title="Lecturer Location"
                />
                <div
                  className={`absolute w-2 h-2 rounded-full ${
                    withinGeofence ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{
                    top: "50%",
                    left: `${50 + Math.min(Math.max((distanceToClass || 0) * 0.5, -25), 25)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  title="Your Location"
                />
              </div>
              <p className="text-xs text-center mt-2 text-gray-600">
                🔴 Lecturer | {withinGeofence ? "🟢" : "🔴"} You | Blue circle =
                allowed area
              </p>
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
              ? `Move closer (${distanceToClass}m away)`
              : "Mark Attendance"}
      </button>
    </div>
  );
}
