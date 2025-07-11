import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../../../config/firebase";
import useUserData from "../../../../hooks/useUserData";
import { useUserStore } from "../../../../store/userStore";

export default function Header() {
  const navigate = useNavigate();
  useUserData();
  const { firstName, lastName, userId } = useUserStore();

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
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-6 mb-8 rounded-xl shadow-lg">
      {/* Left Section */}
      <div>
        <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
        <p className="text-indigo-100">
          Manage your classes and track student attendance with ease
        </p>
      </div>

      {/* Right Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Lecturer Info */}
        <div className="text-sm sm:text-right">
          <p className="font-medium">
            Dr. {firstName} {lastName}
          </p>
          <p className="text-indigo-200">Staff ID: {userId}</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-semibold hover:bg-indigo-100 rounded-md transition duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
