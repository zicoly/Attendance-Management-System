import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Student/Login/Login";
import SignUp from "./pages/Auth/Student/SignUp/SignUp";
import Onboarding from "./pages/Auth/Student/Onboarding/Onboarding";
import Onboarding2 from "./pages/Auth/Student/Onboarding/Onboarding2";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/onboarding/1" element={<Onboarding />} />
        <Route path="/onboarding/2" element={<Onboarding2 />} />
      </Routes>
    </Router>
  );
}
