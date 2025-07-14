import { Zap, BookOpen, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";

export default function QuickAttendance({
  userLocation,
  onMarkAttendance,
  studentInfo = {},
}: any) {
  const [classCode, setClassCode] = useState("");
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [localAttendedClasses, setLocalAttendedClasses] = useState(() => {
    return JSON.parse(localStorage.getItem("studentAttendedClasses") || "[]");
  });

  // Check if student has already attended the class with this code
  const hasAttendedClass = useMemo(() => {
    if (!classCode.trim()) return false;
    return localAttendedClasses.some(
      (attendedClass: any) =>
        attendedClass.classCode?.toUpperCase() === classCode.toUpperCase() &&
        attendedClass.studentId === studentInfo.studentId
    );
  }, [localAttendedClasses, classCode, studentInfo.studentId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!classCode.trim()) {
      setAttendanceStatus({
        type: "error",
        message: "Please enter a class code",
      });
      return;
    }

    // Check if already attended
    if (hasAttendedClass) {
      setAttendanceStatus({
        type: "error",
        message: "You have already marked attendance for this class",
      });
      return;
    }

    setIsMarking(true);
    setAttendanceStatus(null);

    try {
      // Call the parent's attendance marking function
      const result = await onMarkAttendance(classCode, {
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: studentInfo.email,
        level: studentInfo.level,
        phone: studentInfo.phone,
        studentId: studentInfo.studentId,
      });

      // Always update localStorage after successful attendance marking
      // The onMarkAttendance function should handle the actual attendance logic
      const newAttendedClass = {
        id: result?.classId || `quick_${Date.now()}`,
        studentId: studentInfo.studentId,
        classTitle: result?.classTitle || "Quick Attendance",
        classCode: classCode.toUpperCase(),
        markedAt: new Date().toISOString(),
        lecturerName: result?.lecturerName || "Unknown",
        lecturerlastName: result?.lecturerlastName || "",
        attendanceType: "quick",
      };

      const updatedAttendedClasses = [
        ...localAttendedClasses,
        newAttendedClass,
      ];
      localStorage.setItem(
        "studentAttendedClasses",
        JSON.stringify(updatedAttendedClasses)
      );
      setLocalAttendedClasses(updatedAttendedClasses);

      setAttendanceStatus({
        type: "success",
        message: "Attendance marked successfully!",
      });
      setClassCode("");
    } catch (error: any) {
      setAttendanceStatus({
        type: "error",
        message: error.message || "Failed to mark attendance",
      });
    } finally {
      setIsMarking(false);
      // Clear status after 3 seconds
      setTimeout(() => setAttendanceStatus(null), 3000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold ml-4 text-gray-800">
          Quick Attendance
        </h2>
      </div>

      {/* Status Messages */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter Class Code"
            className={`w-full p-4 pr-12 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-lg ${
              hasAttendedClass
                ? "border-green-200 bg-green-50/50"
                : "border-gray-200"
            }`}
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            disabled={isMarking}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {hasAttendedClass ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <BookOpen className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {hasAttendedClass && (
            <p className="text-xs text-green-600 mt-1">
              Already attended this class
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isMarking || hasAttendedClass || !classCode.trim()}
          className={`w-full py-4 px-6 rounded-xl font-semibold transform transition-all duration-300 shadow-lg ${
            isMarking || hasAttendedClass || !classCode.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:scale-105 hover:shadow-xl"
          }`}
        >
          {isMarking
            ? "Marking Attendance..."
            : hasAttendedClass
              ? "Attendance Already Marked"
              : !classCode.trim()
                ? "Enter Class Code"
                : "Mark Attendance"}
        </button>

        {userLocation && (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <MapPin className="mr-3 h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Current Location
              </p>
              <p className="text-xs text-gray-500">
                {userLocation.latitude.toFixed(4)},{" "}
                {userLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
