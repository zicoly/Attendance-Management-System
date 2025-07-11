import { Radar, X } from "lucide-react";
import { useState, useEffect } from "react";

const GeofenceMap = ({ classData, onClose }: any) => {
  const [studentsInRange, setStudentsInRange] = useState([]);
  const [studentsOutOfRange, setStudentsOutOfRange] = useState([]);

  useEffect(() => {
    // Simulate student positions for demo
    const mockStudents: any = [
      { id: 1, name: "John Doe", distance: 45, inRange: true, angle: 30 },
      { id: 2, name: "Jane Smith", distance: 120, inRange: false, angle: 120 },
      { id: 3, name: "Mike Johnson", distance: 30, inRange: true, angle: 200 },
      { id: 4, name: "Sarah Wilson", distance: 80, inRange: true, angle: 300 },
      { id: 5, name: "Tom Brown", distance: 150, inRange: false, angle: 60 },
    ];

    setStudentsInRange(mockStudents.filter((s: any) => s.inRange));
    setStudentsOutOfRange(mockStudents.filter((s: any) => !s.inRange));
  }, []);

  const getStudentPosition = (distance: any, angle: any) => {
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
                  r={classData.allowedRadius * 1.5}
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
                {studentsInRange.map((student: any) => {
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
                {studentsOutOfRange.map((student: any) => {
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
                <span className="font-bold">{classData.allowedRadius}m</span>
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
                {studentsInRange.map((student: any) => (
                  <div key={student.id} className="bg-white/70 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      {student.distance}m away
                    </p>
                  </div>
                ))}
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
                {studentsOutOfRange.map((student: any) => (
                  <div key={student.id} className="bg-white/70 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      {student.distance}m away
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GeofenceMap;
