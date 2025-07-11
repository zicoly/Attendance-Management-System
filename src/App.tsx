import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Student/Login/Login";
import SignUp from "./pages/Auth/Student/SignUp/SignUp";
import LecturerDashboard from "./pages/lecturer/Home/LecturerDashboard";
import StudentDashboard from "./pages/student/Home/StudentDashboard";
import { ToastContainer } from "react-toastify";
import VerifyEmail from "./pages/Auth/VerifyEmail/VerifyEmail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/" element={<Login />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}
