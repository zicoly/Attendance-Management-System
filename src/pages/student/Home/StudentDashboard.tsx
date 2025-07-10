//@ts-nocheck
import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  GraduationCap,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Zap,
  LogOut,
} from "lucide-react";
import { auth } from "../../../config/firebase";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
// Mock Header component since we don't have the actual one
function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error: any) {
      console.log("Error logging out: ", error?.message);
    }
  };
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-6 shadow-lg">
      <div>
        <h1 className="text-2xl font-bold">Student Portal</h1>
        <p className="text-blue-100">
          Track your attendance and manage your profile
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeClasses, setActiveClasses] = useState([]);
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    studentId: "",
    email: "",
    department: "",
    phone: "",
  });
  const [attendedClasses, setAttendedClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadData();
    getUserLocation();
    const interval = setInterval(loadActiveClasses, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    loadActiveClasses();
    loadStudentProfile();
    loadAttendedClasses();
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => setMessage("Location access denied")
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const loadActiveClasses = () => {
    try {
      const lecturerClasses = JSON.parse(
        localStorage.getItem("lecturerClasses") || "[]"
      );
      setActiveClasses(
        lecturerClasses.filter((cls) => new Date(cls.endTime) > new Date())
      );
    } catch (error) {
      setActiveClasses([]);
    }
  };

  const loadStudentProfile = () => {
    try {
      const saved = localStorage.getItem("studentProfile");
      if (saved) setStudentInfo(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadAttendedClasses = () => {
    try {
      const attended = localStorage.getItem("studentAttendedClasses");
      if (attended) setAttendedClasses(JSON.parse(attended));
    } catch (error) {
      setAttendedClasses([]);
    }
  };

  const saveStudentProfile = () => {
    if (!studentInfo.name || !studentInfo.studentId || !studentInfo.email) {
      showMessage("Please fill in all required fields", "error");
      return;
    }
    try {
      localStorage.setItem("studentProfile", JSON.stringify(studentInfo));
      showMessage("Profile saved successfully!", "success");
    } catch (error) {
      showMessage("Error saving profile", "error");
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const isProfileComplete =
    studentInfo.name && studentInfo.studentId && studentInfo.email;

  const markAttendanceByCode = () => {
    if (!classCodeInput.trim()) {
      showMessage("Please enter a class code", "error");
      return;
    }
    if (!isProfileComplete) {
      showMessage("Please complete your profile first", "error");
      return;
    }

    const classToAttend = activeClasses.find(
      (cls) => cls.code.toUpperCase() === classCodeInput.toUpperCase()
    );

    if (!classToAttend) {
      showMessage("Invalid class code or class has ended", "error");
      return;
    }

    markAttendance(classToAttend);
    setClassCodeInput("");
  };

  const markAttendance = (classData) => {
    if (!isProfileComplete) {
      showMessage("Please complete your profile first", "error");
      return;
    }

    // Check if already attended
    const alreadyAttended = attendedClasses.some(
      (cls) =>
        cls.id === classData.id && cls.studentId === studentInfo.studentId
    );

    if (alreadyAttended) {
      showMessage("You have already marked attendance for this class", "error");
      return;
    }

    // Check location if required
    if (classData.locationRequired && userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        classData.latitude,
        classData.longitude
      );

      if (distance > (classData.allowedRadius || 100)) {
        showMessage(
          `You must be within ${classData.allowedRadius || 100}m of the class location`,
          "error"
        );
        return;
      }
    }

    // Mark attendance
    const attendanceRecord = {
      ...classData,
      studentId: studentInfo.studentId,
      studentName: studentInfo.name,
      attendanceTime: new Date().toISOString(),
      location: userLocation,
    };

    const updatedAttended = [...attendedClasses, attendanceRecord];
    setAttendedClasses(updatedAttended);
    localStorage.setItem(
      "studentAttendedClasses",
      JSON.stringify(updatedAttended)
    );

    showMessage("Attendance marked successfully!", "success");
  };

  // Calculate attendance rate
  const attendanceRate =
    attendedClasses.length > 0
      ? (
          (attendedClasses.length /
            (attendedClasses.length + activeClasses.length)) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Header />

      <div className="max-w-7xl mx-auto">
        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 flex items-center transform transition-all duration-300 animate-pulse ${
              messageType === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-emerald-100"
                : "bg-red-50 border-red-500 text-red-800 shadow-red-100"
            } shadow-lg`}
          >
            {messageType === "success" ? (
              <CheckCircle className="mr-3 h-5 w-5" />
            ) : (
              <AlertCircle className="mr-3 h-5 w-5" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Classes
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {activeClasses.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attended</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {attendedClasses.length}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Attendance Rate
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {attendanceRate}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Profile Status
                </p>
                <p className="text-lg font-semibold text-orange-600">
                  {isProfileComplete ? "Complete" : "Incomplete"}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold ml-4 text-gray-800">
                Student Profile
              </h2>
            </div>

            <div className="space-y-5">
              {[
                {
                  key: "name",
                  placeholder: "Full Name *",
                  type: "text",
                  icon: User,
                },
                {
                  key: "studentId",
                  placeholder: "Student ID *",
                  type: "text",
                  icon: GraduationCap,
                },
                {
                  key: "email",
                  placeholder: "Email *",
                  type: "email",
                  icon: User,
                },
                {
                  key: "department",
                  placeholder: "Department",
                  type: "text",
                  icon: BookOpen,
                },
                {
                  key: "phone",
                  placeholder: "Phone",
                  type: "text",
                  icon: User,
                },
              ].map(({ key, placeholder, type, icon: Icon }) => (
                <div key={key} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                    value={studentInfo[key]}
                    onChange={(e) =>
                      setStudentInfo({ ...studentInfo, [key]: e.target.value })
                    }
                  />
                </div>
              ))}

              <button
                onClick={saveStudentProfile}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Save Profile
              </button>
            </div>
          </div>

          {/* Mark Attendance Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold ml-4 text-gray-800">
                Quick Attendance
              </h2>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter Class Code"
                  className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-lg"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <button
                onClick={markAttendanceByCode}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Mark Attendance
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
            </div>
          </div>
        </div>

        {/* Active Classes */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold ml-4 text-gray-800">
              Active Classes ({activeClasses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                    {cls.title}
                  </h3>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {cls.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    {new Date(cls.startTime).toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="mr-2 h-4 w-4" />
                    Code:{" "}
                    <span className="font-mono font-bold ml-1">{cls.code}</span>
                  </div>
                </div>

                <button
                  onClick={() => markAttendance(cls)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>

          {activeClasses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No active classes at the moment
              </p>
              <p className="text-gray-400 text-sm">
                Check back later for new classes
              </p>
            </div>
          )}
        </div>

        {/* Attended Classes */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold ml-4 text-gray-800">
              Attended Classes ({attendedClasses.length})
            </h2>
          </div>

          <div className="space-y-4">
            {attendedClasses.map((cls, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      {cls.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {cls.description}
                    </p>
                    <div className="flex items-center text-sm text-emerald-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Attended: {new Date(cls.attendanceTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {attendedClasses.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No attended classes yet</p>
              <p className="text-gray-400 text-sm">
                Start marking attendance to see your history
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
