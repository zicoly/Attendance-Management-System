import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Student/Login/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}
