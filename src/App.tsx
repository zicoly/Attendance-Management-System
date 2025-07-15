import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import Login from "./pages/Auth/Student/Login/Login";
import SignUp from "./pages/Auth/Student/SignUp/SignUp";
import LecturerDashboard from "./pages/lecturer/Home/LecturerDashboard";
import StudentDashboard from "./pages/student/Home/StudentDashboard";
import { ToastContainer } from "react-toastify";
import VerifyEmail from "./pages/Auth/VerifyEmail/VerifyEmail";
import { StudentTable } from "./components/StudentTable";
import { PersonalAttendanceTable } from "./components/TimetableView";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  console.log(user);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/" element={<Login />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/lecturer-dashboard/history" element={<StudentTable />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route
          path="/student-dashboard/history"
          element={<PersonalAttendanceTable />}
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}
