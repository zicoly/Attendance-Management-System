import { useState } from "react";
import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import useAttendance from "../../../hooks/useAttendance";
import useStudentProfile from "../../../hooks/useStudentProfile";
import ActiveClasses from "../components/ActiveClasses";
import AlertMessage from "../components/AlertMessage";
import AttendedClasses from "../components/AttendedClasses";
import QuickAttendance from "../components/QuickAttendance";
import StatsGrid from "../components/StatsGrid";
import useActiveClasses from "../../../hooks/useActiveClasses";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../config/firebase";
import useUserData from "../../../hooks/useUserData";
import { useUserStore } from "../../../store/userStore";
import { toast } from "react-toastify";
import { History } from "lucide-react";

export default function StudentDashboard() {
  useUserData();
  const { firstName, lastName, userId, department, email } = useUserStore();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const { activeClasses } = useActiveClasses();
  const { attendedClasses, saveAttendedClass } = useAttendance();
  const { studentInfo }: any = useStudentProfile();
  const { userLocation, calculateDistance }: any = useLocation();

  const showMessage = (msg: any, type: any) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };
  // const markAttendance = async (classData: any) => {
  //   try {
  //     // Debug: Log studentInfo to see what data is available
  //     console.log("Student Info:", studentInfo);

  //     // Check if student already attended this class
  //     const alreadyAttended = classData.attendees.some(
  //       (attendee: any) => attendee.studentId === studentInfo.studentId
  //     );

  //     if (alreadyAttended) {
  //       showMessage(
  //         "You have already marked attendance for this class",
  //         "error"
  //       );
  //       return;
  //     }

  //     // Check location if required
  //     if (classData.locationRequired && userLocation) {
  //       const distance = calculateDistance(
  //         userLocation.latitude,
  //         userLocation.longitude,
  //         classData.latitude,
  //         classData.longitude
  //       );

  //       if (distance > (classData.allowedRadius || 100)) {
  //         showMessage(
  //           `You must be within ${classData.allowedRadius || 100}m of the class location`,
  //           "error"
  //         );
  //         return;
  //       }
  //     }

  //     // Create student attendance record with proper null checks
  //     const studentAttendance = {
  //       studentId: userId || "",
  //       firstName: firstName || "",
  //       lastName: lastName || "",
  //       department: department || "",
  //       level: studentInfo.level || "",
  //       email: email || "",
  //       attendanceTime: new Date().toISOString(),
  //       location: userLocation
  //         ? {
  //             latitude: userLocation.latitude || 0,
  //             longitude: userLocation.longitude || 0,
  //           }
  //         : null,
  //       distance:
  //         classData.locationRequired && userLocation
  //           ? calculateDistance(
  //               userLocation.latitude,
  //               userLocation.longitude,
  //               classData.latitude,
  //               classData.longitude
  //             )
  //           : null,
  //     };

  //     // Update the class document by adding student to attendees array
  //     const classRef = doc(db, "classes", classData.id);
  //     await updateDoc(classRef, {
  //       attendees: arrayUnion(studentAttendance),
  //     });

  //     // Also save to local state for immediate UI update
  //     saveAttendedClass({
  //       ...classData,
  //       studentId: userId,
  //       studentName: `${firstName} ${lastName}`,
  //       attendanceTime: new Date().toISOString(),
  //       location: userLocation,
  //     });

  //     showMessage("Attendance marked successfully!", "success");
  //     toast.success("Attendance marked successfully!");
  //   } catch (error) {
  //     console.error("Error marking attendance:", error);
  //     showMessage("Failed to mark attendance. Please try again.", "error");
  //   }
  // };

  const markAttendance = async (classData: any) => {
    try {
      // Debug: Log studentInfo to see what data is available
      console.log("Student Info:", studentInfo);

      // Check if student already attended this class
      const alreadyAttended = classData.attendees.some(
        (attendee: any) => attendee.studentId === studentInfo.studentId
      );

      if (alreadyAttended) {
        // Throw an error instead of just showing message and returning
        throw new Error("You have already marked attendance for this class");
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
          // Throw an error instead of just showing message and returning
          throw new Error(
            `You must be within ${classData.allowedRadius || 100}m of the class location`
          );
        }
      }

      // Create student attendance record with proper null checks
      const studentAttendance = {
        studentId: userId || "",
        firstName: firstName || "",
        lastName: lastName || "",
        department: department || "",
        level: studentInfo.level || "",
        email: email || "",
        attendanceTime: new Date().toISOString(),
        location: userLocation
          ? {
              latitude: userLocation.latitude || 0,
              longitude: userLocation.longitude || 0,
            }
          : null,
        distance:
          classData.locationRequired && userLocation
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                classData.latitude,
                classData.longitude
              )
            : null,
      };

      // Update the class document by adding student to attendees array
      const classRef = doc(db, "classes", classData.id);
      await updateDoc(classRef, {
        attendees: arrayUnion(studentAttendance),
      });

      // Also save to local state for immediate UI update
      saveAttendedClass({
        ...classData,
        studentId: userId,
        studentName: `${firstName} ${lastName}`,
        attendanceTime: new Date().toISOString(),
        location: userLocation,
      });

      showMessage("Attendance marked successfully!", "success");
      toast.success("Attendance marked successfully, reload your page!");
    } catch (error: any) {
      console.error("Error marking attendance:", error);

      // Show the error message in the parent component too
      showMessage(
        error.message || "Failed to mark attendance. Please try again.",
        "error"
      );

      // Re-throw the error so the child component can catch it
      throw error;
    }
  };
  const markAttendanceByCode = (classCode: any) => {
    if (!classCode.trim()) {
      showMessage("Please enter a class code", "error");
      return;
    }

    const classToAttend = activeClasses.find(
      (cls: any) => cls.code.toUpperCase() === classCode.toUpperCase()
    );

    if (!classToAttend) {
      showMessage("Invalid class code or class has ended", "error");
      return;
    }

    markAttendance(classToAttend);
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
      <section className="w-full flex justify-between items-center">
        <button
          className="my-6 border bg-indigo-600 p-2 text-white"
          onClick={() => {
            localStorage.clear();
            alert("Local storage cleared!");
          }}
        >
          Clear LocalStorage
        </button>
        <div className="mb-8">
          <Link
            to="/student-dashboard/history"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 border border-gray-200"
          >
            <History className="w-4 h-4" />
            History
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        <AlertMessage message={message} type={messageType} />

        <StatsGrid
          activeClassesCount={activeClasses.length}
          attendedClassesCount={attendedClasses.length}
          attendanceRate={attendanceRate}
        />

        <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
          <QuickAttendance
            userLocation={userLocation}
            onMarkAttendance={markAttendanceByCode}
          />
        </div>

        <ActiveClasses
          classes={activeClasses}
          onMarkAttendance={markAttendance}
        />

        <AttendedClasses classes={attendedClasses} />
      </div>
    </div>
  );
}
