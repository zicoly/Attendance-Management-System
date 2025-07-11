import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Plus,
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import GeofenceMap from "./components/GeofenceMap";
import CreateClassModal from "./modals/CreateClass";
import ClassCard from "./components/ClassCard";

export default function LecturerDashboard() {
  const [activeClasses, setActiveClasses] = useState<any>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [showGeofence, setShowGeofence] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadClasses();
    const interval = setInterval(loadClasses, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadClasses = () => {
    // Mock data for demo
    const mockClasses = [
      {
        id: 1,
        title: "Advanced React Development",
        code: "ADV123",
        duration: 90,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 90 * 60000).toISOString(),
        locationRequired: true,
        allowedRadius: 100,
        attendees: [
          {
            studentName: "John Doe",
            studentId: "CS2021001",
            email: "john@example.com",
            attendanceTime: new Date().toISOString(),
          },
          {
            studentName: "Jane Smith",
            studentId: "CS2021002",
            email: "jane@example.com",
            attendanceTime: new Date().toISOString(),
          },
        ],
      },
      {
        id: 2,
        title: "Database Systems",
        code: "DB456",
        duration: 60,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60000).toISOString(),
        locationRequired: false,
        allowedRadius: 50,
        attendees: [
          {
            studentName: "Mike Johnson",
            studentId: "CS2021003",
            email: "mike@example.com",
            attendanceTime: new Date().toISOString(),
          },
        ],
      },
    ];
    setActiveClasses(mockClasses);
  };

  const generateClassCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const copyClassCode = (code: any) => {
    navigator.clipboard.writeText(code);
    setIsCodeCopied(true);
    setCopiedCode(code);
    setTimeout(() => {
      setIsCodeCopied(false);
      setCopiedCode("");
    }, 2000);
  };

  const createClass = ({
    className,
    classDuration,
    locationRequired,
    allowedRadius,
  }: any) => {
    const code = generateClassCode();
    const newClass = {
      id: Date.now(),
      title: className,
      code,
      duration: classDuration,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + classDuration * 60000).toISOString(),
      attendees: [],
      locationRequired,
      allowedRadius,
    };

    setActiveClasses((prev: any) => [...prev, newClass]);
    setIsCreatingClass(false);
  };

  const endClass = (classId: any) => {
    setActiveClasses((prev: any) =>
      prev.filter((cls: any) => cls.id !== classId)
    );
  };

  const downloadAttendance = (classData: any) => {
    if (!classData.attendees || classData.attendees.length === 0) {
      alert("No attendance data to download");
      return;
    }

    const headers = ["Name", "Student ID", "Email", "Time Signed"];
    const csvContent = [
      headers.join(","),
      ...classData.attendees.map((student: any) =>
        [
          student.studentName,
          student.studentId,
          student.email,
          new Date(student.attendanceTime).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${classData.title}_attendance.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewGeofence = (classData: any) => {
    setSelectedClass(classData);
    setShowGeofence(true);
  };

  const totalStudents = activeClasses.reduce(
    (acc: any, cls: any) => acc + (cls.attendees?.length || 0),
    0
  );
  const averageAttendance =
    activeClasses.length > 0
      ? (totalStudents / activeClasses.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Welcome back!
          </h2>
          <p className="text-gray-600 text-lg">
            Manage your classes and track student attendance with geofencing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Classes"
            value={activeClasses.length}
            subtitle="Live now"
            icon={Activity}
            gradient="bg-gradient-to-r from-green-500 to-emerald-500"
            textColor="text-green-600"
          />
          <StatsCard
            title="Total Students"
            value={totalStudents}
            subtitle="Registered"
            icon={Users}
            gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
            textColor="text-blue-600"
          />
          <StatsCard
            title="Avg. Attendance"
            value={averageAttendance}
            subtitle="Per class"
            icon={BarChart3}
            gradient="bg-gradient-to-r from-purple-500 to-violet-500"
            textColor="text-purple-600"
          />
          <StatsCard
            title="Sessions Today"
            value={activeClasses.length}
            subtitle="Current"
            icon={Calendar}
            gradient="bg-gradient-to-r from-orange-500 to-amber-500"
            textColor="text-orange-600"
          />
        </div>

        <div className="mb-8">
          <button
            onClick={() => setIsCreatingClass(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Plus className="w-5 h-5" />
            </div>
            Create New Class
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <CreateClassModal
          isOpen={isCreatingClass}
          onClose={() => setIsCreatingClass(false)}
          onSubmit={createClass}
        />

        {showGeofence && selectedClass && (
          <GeofenceMap
            classData={selectedClass}
            onClose={() => setShowGeofence(false)}
          />
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Active Classes</h3>
            <div className="bg-indigo-100 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-indigo-600">
                {activeClasses.length}
              </span>
            </div>
          </div>

          {activeClasses.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-indigo-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                No Active Classes
              </h4>
              <p className="text-gray-600 mb-6">
                Create your first class to start tracking student attendance!
              </p>
              <button
                onClick={() => setIsCreatingClass(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Create Class
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeClasses.map((cls: any) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  onEndClass={endClass}
                  onDownload={downloadAttendance}
                  onViewGeofence={viewGeofence}
                  onCopyCode={copyClassCode}
                  isCodeCopied={isCodeCopied}
                  copiedCode={copiedCode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
