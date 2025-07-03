//@ts-nocheck
import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Plus,
  Copy,
  Check,
  Download,
  BookOpen,
  Calendar,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  User,
  Mail,
  X,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock Header component
function Header() {
  return (
    <div className=" flex justify-between  bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-6 mb-8">
      <div className="">
        <h1 className="text-3xl font-bold mb-2">Lecturer Dashboard</h1>
        <p className="text-indigo-100">
          Manage your classes and track student attendance with ease
        </p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </Link>
    </div>
  );
}

export default function LecturerDashboard() {
  const [activeClasses, setActiveClasses] = useState([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [className, setClassName] = useState("");
  const [classDuration, setClassDuration] = useState(60);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    loadClasses();
    const interval = setInterval(loadClasses, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadClasses = () => {
    try {
      const savedClasses = JSON.parse(
        localStorage.getItem("lecturerClasses") || "[]"
      );
      const currentClasses = savedClasses.filter(
        (cls) => new Date(cls.endTime) > new Date()
      );

      const studentAttendance = JSON.parse(
        localStorage.getItem("studentAttendedClasses") || "[]"
      );

      const updatedClasses = currentClasses.map((cls) => {
        const attendees = studentAttendance.filter(
          (att) => att.code === cls.code
        );
        return { ...cls, attendees };
      });

      setActiveClasses(updatedClasses);

      if (updatedClasses.length !== savedClasses.length) {
        localStorage.setItem("lecturerClasses", JSON.stringify(updatedClasses));
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const generateClassCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    setIsCodeCopied(true);
    setCopiedCode(code);
    setTimeout(() => {
      setIsCodeCopied(false);
      setCopiedCode("");
    }, 2000);
  };

  const createClass = () => {
    if (!className.trim()) return;

    const code = generateClassCode();
    const newClass = {
      id: Date.now(),
      title: className,
      description: `Class session - ${className}`,
      code,
      duration: classDuration,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + classDuration * 60000).toISOString(),
      attendees: [],
      locationRequired: false,
      latitude: 0,
      longitude: 0,
      allowedRadius: 100,
    };

    const savedClasses = JSON.parse(
      localStorage.getItem("lecturerClasses") || "[]"
    );
    const updatedClasses = [...savedClasses, newClass];
    localStorage.setItem("lecturerClasses", JSON.stringify(updatedClasses));

    setActiveClasses((prev) => [...prev, newClass]);
    setIsCreatingClass(false);
    setClassName("");
  };

  const endClass = (classId) => {
    const updatedClasses = activeClasses.filter((cls) => cls.id !== classId);
    setActiveClasses(updatedClasses);
    localStorage.setItem("lecturerClasses", JSON.stringify(updatedClasses));
  };

  const downloadAttendance = (classData) => {
    if (!classData.attendees || classData.attendees.length === 0) {
      alert("No attendance data to download");
      return;
    }

    const headers = [
      "Name",
      "Student ID",
      "Email",
      "Department",
      "Phone",
      "Time Signed",
    ];
    const csvContent = [
      headers.join(","),
      ...classData.attendees.map((student) =>
        [
          student.studentName || "N/A",
          student.studentId || "N/A",
          student.email || "N/A",
          student.department || "N/A",
          student.phone || "N/A",
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

  const totalStudents = activeClasses.reduce(
    (acc, cls) => acc + (cls.attendees?.length || 0),
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Welcome back!
            </h2>
            <p className="text-gray-600 text-lg">
              Manage your classes and track student attendance with powerful
              analytics.
            </p>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Active Classes
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeClasses.length}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Live now
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalStudents}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  Registered
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Avg. Attendance
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageAttendance}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  Per class
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-full">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Sessions Today
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeClasses.length}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Current
                </p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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

        {/* Enhanced Create Class Modal */}
        {isCreatingClass && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Create New Class
                </h3>
                <button
                  onClick={() => setIsCreatingClass(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Class Name
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                      placeholder="Enter class name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Duration (minutes)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    value={classDuration}
                    onChange={(e) => setClassDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>15 min</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {classDuration} minutes
                    </span>
                    <span>180 min</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setIsCreatingClass(false)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createClass}
                  disabled={!className.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Active Classes Section */}
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
              {activeClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Class Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                          {cls.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                            <span className="font-medium text-gray-700">
                              Code:
                            </span>
                            <span className="font-mono bg-indigo-100 px-2 py-1 rounded text-indigo-700 font-bold">
                              {cls.code}
                            </span>
                            <button
                              onClick={() => copyClassCode(cls.code)}
                              className="ml-1 p-1 hover:bg-indigo-100 rounded transition-colors"
                            >
                              {isCodeCopied && copiedCode === cls.code ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">
                              {cls.duration} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-blue-600">
                              {cls.attendees?.length || 0} students
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => downloadAttendance(cls)}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => endClass(cls.id)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          End Class
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Section */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-full">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <h5 className="text-lg font-bold text-gray-900">
                        Attendance History
                      </h5>
                      <div className="bg-emerald-100 px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold text-emerald-600">
                          {cls.attendees?.length || 0} students
                        </span>
                      </div>
                    </div>

                    {cls.attendees && cls.attendees.length > 0 ? (
                      <div className="space-y-4">
                        {cls.attendees.map((attendee, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-full">
                                  <User className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Student Name
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {attendee.studentName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-full">
                                  <FileText className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Student ID
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {attendee.studentId}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                  <Mail className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Email
                                  </p>
                                  <p className="text-sm text-gray-700 truncate">
                                    {attendee.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-full">
                                  <Clock className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Time Signed
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {new Date(
                                      attendee.attendanceTime
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          No Students Yet
                        </h4>
                        <p className="text-gray-500 mb-1">
                          No students have signed attendance yet.
                        </p>
                        <p className="text-sm text-gray-400">
                          Share the class code{" "}
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {cls.code}
                          </span>{" "}
                          with students to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
