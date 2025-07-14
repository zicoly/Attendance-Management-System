//@ts-nocheck
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Plus,
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  History,
} from "lucide-react";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import GeofenceMap from "./components/GeofenceMap";
import CreateClassModal from "./modals/CreateClass";
import ClassCard from "./components/ClassCard";
import {
  query,
  collection,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

export default function LecturerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeClasses, setActiveClasses] = useState<any>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [showGeofence, setShowGeofence] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  // 1. First, properly manage auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      console.log(
        "Auth state changed:",
        currentUser ? "User logged in" : "No user"
      );
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Set up Firestore listener only after auth is ready
  useEffect(() => {
    if (authLoading) {
      console.log("Still loading auth state...");
      return;
    }

    if (!user) {
      console.log("No user authenticated, clearing classes");
      setActiveClasses([]);
      return;
    }

    console.log("Setting up real-time listener for user:", user.uid);

    // Create the query without orderBy to avoid index issues
    const classesQuery = query(
      collection(db, "classes"),
      where("lecturerId", "==", user.uid),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(classesQuery, {
      next: (snapshot) => {
        console.log("✅ Query successful, documents found:", snapshot.size);

        const classes = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document:", doc.id, data);

          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : data.createdAt,
            endTime: data.createdAt?.toDate
              ? new Date(
                  data.createdAt.toDate().getTime() + data.duration * 60000
                )
              : null,
          };
        });

        // Sort classes by creation time (newest first)
        classes.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        console.log("Processed classes:", classes);
        setActiveClasses(classes);
      },
      error: (error) => {
        console.error("❌ Firestore query error:", error);

        // Check common error types
        if (error.code === "failed-precondition") {
          console.error(
            "Index might be missing. Check Firestore console for index creation."
          );
        } else if (error.code === "permission-denied") {
          console.error("Permission denied. Check Firestore security rules.");
        }

        // Set empty array on error
        setActiveClasses([]);
      },
    });

    return () => {
      console.log("Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [user, authLoading]);

  // Manual fetch function for debugging
  const manualFetch = async () => {
    if (!user) {
      console.log("No user for manual fetch");
      return;
    }

    try {
      console.log("Starting manual fetch for user:", user.uid);
      const classesQuery = query(
        collection(db, "classes"),
        where("lecturerId", "==", user.uid)
      );

      const snapshot = await getDocs(classesQuery);
      console.log("Manual fetch result:", snapshot.size, "documents");

      snapshot.docs.forEach((doc) => {
        console.log("Doc:", doc.id, doc.data());
      });
    } catch (error) {
      console.error("Manual fetch error:", error);
    }
  };

  // Utility functions
  const getRemainingTime = (createdAt: any, duration: any) => {
    if (!createdAt || !duration) return 0;
    const endTime = new Date(createdAt.getTime() + duration * 60000);
    const now = new Date();
    return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
  };

  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const copyClassCode = (code: any) => {
    navigator.clipboard.writeText(code);
    setIsCodeCopied(true);
    setCopiedCode(code);
    setTimeout(() => {
      setIsCodeCopied(false);
      setCopiedCode("");
    }, 2000);
  };

  const createClass = (classData: any) => {
    // Don't manually add to state - let the real-time listener handle it
    console.log("Class created:", classData);
    setIsCreatingClass(false);
    // The onSnapshot listener will automatically update the UI
  };

  const endClass = async (classId: any) => {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, {
        isActive: false,
        endedAt: new Date(),
      });
      console.log("Class ended:", classId);
      // Real-time listener will update the UI automatically
    } catch (error) {
      console.error("Error ending class:", error);
    }
  };

  const downloadAttendance = (classData: any) => {
    if (!classData.attendees || classData.attendees.length === 0) {
      alert("No attendance data to download");
      return;
    }

    const headers = [
      "First Name",
      "Last Name",
      "Matric Number",
      "Email",
      "Date",
      "Time Signed",
    ];
    const csvContent = [
      headers.join(","),
      ...classData.attendees.map((student: any) =>
        [
          student.firstName,
          student.lastName,
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

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access the lecturer dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  manualFetch();

  // const loadClasses = () => {
  //   // Mock data for demo
  //   const mockClasses = [
  //     {
  //       id: 1,
  //       title: "Advanced React Development",
  //       code: "ADV123",
  //       duration: 90,
  //       startTime: new Date().toISOString(),
  //       endTime: new Date(Date.now() + 90 * 60000).toISOString(),
  //       locationRequired: true,
  //       allowedRadius: 100,
  //       attendees: [
  //         {
  //           studentName: "John Doe",
  //           studentId: "CS2021001",
  //           email: "john@example.com",
  //           attendanceTime: new Date().toISOString(),
  //         },
  //         {
  //           studentName: "Jane Smith",
  //           studentId: "CS2021002",
  //           email: "jane@example.com",
  //           attendanceTime: new Date().toISOString(),
  //         },
  //       ],
  //     },
  //     {
  //       id: 2,
  //       title: "Database Systems",
  //       code: "DB456",
  //       duration: 60,
  //       startTime: new Date().toISOString(),
  //       endTime: new Date(Date.now() + 60 * 60000).toISOString(),
  //       locationRequired: false,
  //       allowedRadius: 50,
  //       attendees: [
  //         {
  //           studentName: "Mike Johnson",
  //           studentId: "CS2021003",
  //           email: "mike@example.com",
  //           attendanceTime: new Date().toISOString(),
  //         },
  //       ],
  //     },
  //   ];
  //   setActiveClasses(mockClasses);
  // };

  // const generateClassCode = () =>
  //   Math.random().toString(36).substring(2, 8).toUpperCase();

  // // const copyClassCode = (code: any) => {
  // //   navigator.clipboard.writeText(code);
  // //   setIsCodeCopied(true);
  // //   setCopiedCode(code);
  // //   setTimeout(() => {
  // //     setIsCodeCopied(false);
  // //     setCopiedCode("");
  // //   }, 2000);
  // // };

  // // const endClass = (classId: any) => {
  // //   setActiveClasses((prev: any) =>
  // //     prev.filter((cls: any) => cls.id !== classId)
  // //   );
  // // };
  // const copyClassCode = (code: string) => {
  //   navigator.clipboard.writeText(code);
  //   setIsCodeCopied(true);
  //   setCopiedCode(code);
  //   setTimeout(() => {
  //     setIsCodeCopied(false);
  //     setCopiedCode("");
  //   }, 2000);
  // };
  // const endClass = async (classId: string) => {
  //   try {
  //     const classRef = doc(db, "classes", classId);
  //     await updateDoc(classRef, {
  //       isActive: false,
  //       endedAt: new Date(),
  //     });

  //     // Remove from local state immediately for better UX
  //     setActiveClasses((prev) => prev.filter((cls) => cls.id !== classId));

  //     console.log("Class ended successfully");
  //   } catch (error) {
  //     console.error("Error ending class:", error);
  //     alert("Failed to end class. Please try again.");
  //   }
  // };

  // const viewGeofence = (classData: any) => {
  //   setSelectedClass(classData);
  //   setShowGeofence(true);
  // };
  // // Calculate remaining time for a class
  // const getRemainingTime = (createdAt: Date, duration: number) => {
  //   if (!createdAt) return 0;

  //   const endTime = new Date(createdAt.getTime() + duration * 60000);
  //   const now = new Date();
  //   const remaining = Math.max(0, endTime.getTime() - now.getTime());

  //   return Math.floor(remaining / 1000); // Return in seconds
  // };

  // // Format time in MM:SS format
  // const formatTime = (seconds: number) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  // };

  // const totalStudents = activeClasses.reduce(
  //   (acc: any, cls: any) => acc + (cls.attendees?.length || 0),
  //   0
  // );
  // const averageAttendance =
  //   activeClasses.length > 0
  //     ? (totalStudents / activeClasses.length).toFixed(1)
  //     : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Welcome back!
          </h2>
          <p className="text-gray-600 text-lg">
            Manage your classes and track student attendance with geofencing
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
            // value={totalStudents}
            subtitle="Registered"
            icon={Users}
            gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
            textColor="text-blue-600"
          />
          <StatsCard
            title="Avg. Attendance"
            // value={averageAttendance}
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
        {/* operations */}
        <section className="w-full flex justify-between items-center">
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

          <div className="mb-8">
            <Link
              to="/lecturer-dashboard/history"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 border border-gray-200"
            >
              <History className="w-4 h-4" />
              History
            </Link>
          </div>
        </section>
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
                  cls={{
                    ...cls,
                    // Add computed properties for the ClassCard
                    remainingTime: getRemainingTime(
                      cls.createdAt,
                      cls.duration
                    ),
                    formattedRemainingTime: formatTime(
                      getRemainingTime(cls.createdAt, cls.duration)
                    ),
                    attendeeCount: cls.attendees?.length || 0,
                  }}
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
