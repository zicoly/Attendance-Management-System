import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Siderbar";

const StudentLayout = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  </div>
);

export default StudentLayout;
