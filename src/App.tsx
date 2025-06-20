import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Student/Login/Login";
import SignUp from "./pages/Auth/Student/SignUp/SignUp";
import Onboarding from "./pages/Auth/Student/Onboarding/Onboarding";
import Onboarding2 from "./pages/Auth/Student/Onboarding/Onboarding2";
import { useAuth } from "./context/AuthContext";
import LecturerLayout from "./layouts/LecturerLayout";
import StudentLayout from "./layouts/StudentLayout";
import LecturerDashboard from "./pages/lecturer/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";

export default function App() {
  const { role } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/onboarding/1" element={<Onboarding />} />
        <Route path="/onboarding/2" element={<Onboarding2 />} />

        {/* change the role to "student" to design your view */}
        {role === "lecturer" ? (
          <Route element={<LecturerLayout />}>
            <Route path="/dashboard" element={<LecturerDashboard />} />
          </Route>
        ) : (
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
