// import { Radar, X } from "lucide-react";
// import { useState, useEffect } from "react";

// const GeofenceMap = ({ classData, onClose }: any) => {
//   const [studentsInRange, setStudentsInRange] = useState([]);
//   const [studentsOutOfRange, setStudentsOutOfRange] = useState([]);

//   useEffect(() => {
//     // Simulate student positions for demo
//     const mockStudents: any = [
//       { id: 1, name: "John Doe", distance: 45, inRange: true, angle: 30 },
//       { id: 2, name: "Jane Smith", distance: 120, inRange: false, angle: 120 },
//       { id: 3, name: "Mike Johnson", distance: 30, inRange: true, angle: 200 },
//       { id: 4, name: "Sarah Wilson", distance: 80, inRange: true, angle: 300 },
//       { id: 5, name: "Tom Brown", distance: 150, inRange: false, angle: 60 },
//     ];

//     setStudentsInRange(mockStudents.filter((s: any) => s.inRange));
//     setStudentsOutOfRange(mockStudents.filter((s: any) => !s.inRange));
//   }, []);

//   const getStudentPosition = (distance: any, angle: any) => {
//     const centerX = 200;
//     const centerY = 200;
//     const scale = 1.5;
//     const x = centerX + distance * scale * Math.cos((angle * Math.PI) / 180);
//     const y = centerY + distance * scale * Math.sin((angle * Math.PI) / 180);
//     return { x, y };
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-white/20">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-full">
//               <Radar className="w-5 h-5 text-white" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900">
//               Geofence Monitor
//             </h3>
//             <span className="text-sm text-gray-500">- {classData.title}</span>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Map View */}
//           <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
//             <div className="relative">
//               <svg width="400" height="400" className="mx-auto">
//                 {/* Geofence Circle */}
//                 <circle
//                   cx="200"
//                   cy="200"
//                   r={classData.allowedRadius * 1.5}
//                   fill="rgba(34, 197, 94, 0.1)"
//                   stroke="rgba(34, 197, 94, 0.3)"
//                   strokeWidth="2"
//                   strokeDasharray="5,5"
//                 />

//                 {/* Center Point (Lecturer) */}
//                 <circle cx="200" cy="200" r="8" fill="#4F46E5" />
//                 <text
//                   x="200"
//                   y="220"
//                   textAnchor="middle"
//                   className="text-sm font-medium fill-gray-700"
//                 >
//                   Lecturer
//                 </text>

//                 {/* Students in Range */}
//                 {studentsInRange.map((student: any) => {
//                   const pos = getStudentPosition(
//                     student.distance,
//                     student.angle
//                   );
//                   return (
//                     <g key={student.id}>
//                       <circle
//                         cx={pos.x}
//                         cy={pos.y}
//                         r="6"
//                         fill="#10B981"
//                         className="animate-pulse"
//                       />
//                       <text
//                         x={pos.x}
//                         y={pos.y - 12}
//                         textAnchor="middle"
//                         className="text-xs font-medium fill-green-700"
//                       >
//                         {student.name.split(" ")[0]}
//                       </text>
//                     </g>
//                   );
//                 })}

//                 {/* Students Out of Range */}
//                 {studentsOutOfRange.map((student: any) => {
//                   const pos = getStudentPosition(
//                     student.distance,
//                     student.angle
//                   );
//                   return (
//                     <g key={student.id}>
//                       <circle
//                         cx={pos.x}
//                         cy={pos.y}
//                         r="6"
//                         fill="#EF4444"
//                         className="animate-pulse"
//                       />
//                       <text
//                         x={pos.x}
//                         y={pos.y - 12}
//                         textAnchor="middle"
//                         className="text-xs font-medium fill-red-700"
//                       >
//                         {student.name.split(" ")[0]}
//                       </text>
//                     </g>
//                   );
//                 })}
//               </svg>
//             </div>

//             <div className="mt-4 text-center">
//               <p className="text-sm text-gray-600">
//                 Safe Zone Radius:{" "}
//                 <span className="font-bold">{classData.allowedRadius}m</span>
//               </p>
//             </div>
//           </div>

//           {/* Student List */}
//           <div className="space-y-4">
//             <div className="bg-green-50 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 <h4 className="font-semibold text-green-800">
//                   In Range ({studentsInRange.length})
//                 </h4>
//               </div>
//               <div className="space-y-2">
//                 {studentsInRange.map((student: any) => (
//                   <div key={student.id} className="bg-white/70 rounded-lg p-3">
//                     <p className="font-medium text-gray-900">{student.name}</p>
//                     <p className="text-sm text-gray-600">
//                       {student.distance}m away
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-red-50 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                 <h4 className="font-semibold text-red-800">
//                   Out of Range ({studentsOutOfRange.length})
//                 </h4>
//               </div>
//               <div className="space-y-2">
//                 {studentsOutOfRange.map((student: any) => (
//                   <div key={student.id} className="bg-white/70 rounded-lg p-3">
//                     <p className="font-medium text-gray-900">{student.name}</p>
//                     <p className="text-sm text-gray-600">
//                       {student.distance}m away
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default GeofenceMap;
//@ts-nocheck
import { Radar, X, MapPin, Users, Clock, Eye } from "lucide-react";
import { useState, useEffect } from "react";

const GeofenceMap = ({ classData, onClose }) => {
  const [studentsInRange, setStudentsInRange] = useState([]);
  const [studentsOutOfRange, setStudentsOutOfRange] = useState([]);

  // Function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  // Function to calculate bearing/angle between two coordinates
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(dLon);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
  };

  useEffect(() => {
    if (!classData || !classData.geofence || !classData.attendees) return;

    const lecturerLat = classData.geofence.latitude;
    const lecturerLon = classData.geofence.longitude;
    const allowedRadius = classData.geofence.radius;

    // Process attendees and check if they're in range
    const processedStudents = classData.attendees.map((attendee, index) => {
      // Check if attendee has location data
      if (
        attendee.location &&
        attendee.location.latitude &&
        attendee.location.longitude
      ) {
        const distance = calculateDistance(
          lecturerLat,
          lecturerLon,
          attendee.location.latitude,
          attendee.location.longitude
        );

        const angle = calculateBearing(
          lecturerLat,
          lecturerLon,
          attendee.location.latitude,
          attendee.location.longitude
        );

        const inRange = distance <= allowedRadius;

        return {
          id: attendee.id || index,
          name: attendee.name || attendee.email || `Student ${index + 1}`,
          distance: Math.round(distance),
          angle: angle,
          inRange: inRange,
          hasLocation: true,
        };
      } else {
        // Student without location data
        return {
          id: attendee.id || index,
          name: attendee.name || attendee.email || `Student ${index + 1}`,
          distance: null,
          angle: null,
          inRange: false,
          hasLocation: false,
        };
      }
    });

    setStudentsInRange(processedStudents.filter((s) => s.inRange));
    setStudentsOutOfRange(processedStudents.filter((s) => !s.inRange));
  }, [classData]);

  const getStudentPosition = (distance, angle) => {
    const centerX = 200;
    const centerY = 200;
    const scale = 1.5;
    const x = centerX + distance * scale * Math.cos((angle * Math.PI) / 180);
    const y = centerY + distance * scale * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-full">
              <Radar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Geofence Monitor
            </h3>
            <span className="text-sm text-gray-500">- {classData.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="relative">
              <svg width="400" height="400" className="mx-auto">
                {/* Geofence Circle */}
                <circle
                  cx="200"
                  cy="200"
                  r={classData.geofence?.radius * 1.5 || 100}
                  fill="rgba(34, 197, 94, 0.1)"
                  stroke="rgba(34, 197, 94, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* Center Point (Lecturer) */}
                <circle cx="200" cy="200" r="8" fill="#4F46E5" />
                <text
                  x="200"
                  y="220"
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  Lecturer
                </text>

                {/* Students in Range */}
                {studentsInRange.map((student) => {
                  if (!student.hasLocation) return null;

                  const pos = getStudentPosition(
                    student.distance,
                    student.angle
                  );
                  return (
                    <g key={student.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="6"
                        fill="#10B981"
                        className="animate-pulse"
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 12}
                        textAnchor="middle"
                        className="text-xs font-medium fill-green-700"
                      >
                        {student.name.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Students Out of Range */}
                {studentsOutOfRange.map((student) => {
                  if (!student.hasLocation) return null;

                  const pos = getStudentPosition(
                    student.distance,
                    student.angle
                  );
                  return (
                    <g key={student.id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="6"
                        fill="#EF4444"
                        className="animate-pulse"
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 12}
                        textAnchor="middle"
                        className="text-xs font-medium fill-red-700"
                      >
                        {student.name.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Safe Zone Radius:{" "}
                <span className="font-bold">
                  {classData.geofence?.radius || "N/A"}m
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Location: {classData.geofence?.address || "No address set"}
              </p>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-semibold text-green-800">
                  In Range ({studentsInRange.length})
                </h4>
              </div>
              <div className="space-y-2">
                {studentsInRange.map((student) => (
                  <div key={student.id} className="bg-white/70 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      {student.hasLocation
                        ? `${student.distance}m away`
                        : "Location not available"}
                    </p>
                  </div>
                ))}
                {studentsInRange.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No students in range
                  </p>
                )}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="font-semibold text-red-800">
                  Out of Range ({studentsOutOfRange.length})
                </h4>
              </div>
              <div className="space-y-2">
                {studentsOutOfRange.map((student) => (
                  <div key={student.id} className="bg-white/70 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      {student.hasLocation
                        ? `${student.distance}m away`
                        : "Location not shared"}
                    </p>
                  </div>
                ))}
                {studentsOutOfRange.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    All students in range
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassManagementApp = () => {
  const [showGeofence, setShowGeofence] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Mock active classes data with real structure
  const activeClasses = [
    {
      id: 1,
      title: "csc 411",
      code: "7YVN3R",
      lecturerName: "nomagamesteam@gmail.com",
      lecturerEmail: "nomagamesteam@gmail.com",
      duration: 15,
      isActive: false,
      locationRequired: true,
      geofence: {
        enabled: true,
        latitude: 7.323431491851804,
        longitude: 3.881536960601805,
        radius: 1,
        address: "Podo, Oluyole, Oyo State, 200273, Nigeria",
      },
      attendees: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          location: {
            latitude: 7.323431491851804,
            longitude: 3.881536960601805,
          },
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          location: {
            latitude: 7.323431491851804,
            longitude: 3.881536960601805,
          },
        },
        {
          id: 3,
          name: "Mike Johnson",
          email: "mike@example.com",
          // No location data - student hasn't shared location
        },
      ],
    },
    {
      id: 2,
      title: "Mathematics 201",
      code: "MATH201",
      lecturerName: "Prof. Johnson",
      lecturerEmail: "johnson@example.com",
      duration: 60,
      isActive: true,
      locationRequired: true,
      geofence: {
        enabled: true,
        latitude: 7.323431491851804,
        longitude: 3.881536960601805,
        radius: 50,
        address: "University Campus, Nigeria",
      },
      attendees: [
        {
          id: 4,
          name: "Sarah Wilson",
          email: "sarah@example.com",
          location: {
            latitude: 7.323431491851804,
            longitude: 3.881536960601805,
          },
        },
      ],
    },
  ];

  const handleViewGeofence = (classData) => {
    setSelectedClass(classData);
    setShowGeofence(true);
  };

  const handleCloseGeofence = () => {
    setShowGeofence(false);
    setSelectedClass(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Class Management Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor active classes and student attendance
          </p>
        </div>

        {/* Geofence Modal */}
        {showGeofence && selectedClass && (
          <GeofenceMap
            classData={selectedClass}
            onClose={handleCloseGeofence}
          />
        )}

        {/* Active Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {cls.isActive ? "Active" : "Ended"}
                  </span>
                </div>
                <button
                  onClick={() => handleViewGeofence(cls)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                  title="View Geofence"
                >
                  <Eye className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {cls.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{cls.lecturerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{cls.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {cls.geofence?.address || "No location set"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {cls.attendees?.length || 0} students
                </div>
                <button
                  onClick={() => handleViewGeofence(cls)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Radar className="w-4 h-4" />
                  Monitor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassManagementApp;
