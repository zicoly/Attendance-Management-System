import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../../../../config/firebase";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { toast } from "react-toastify";
import { query, collection, where, getDocs } from "firebase/firestore";

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      email: email,
      password: password,
    };
    console.log("Payload: ", payload);

    try {
      // First, authenticate the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("user logged in successfully", user);

      // Query Users collection by email
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the first matching document
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userRole = userData.role;

        console.log("User role:", userRole);
        console.log("User data:", userData);

        // Navigate based on role
        if (userRole === "student") {
          toast.success("Logged in successfully!");
          setIsLoading(false);
          console.log("Navigating to / for student");
          navigate("/student-dashboard", { replace: true });
        } else if (userRole === "lecturer") {
          toast.success("Logged in successfully!");
          setIsLoading(false);
          console.log("Navigating to /lecturer-dashboard for lecturer");
          navigate("/lecturer-dashboard", { replace: true });
        } else {
          // Handle unknown role
          toast.error("Invalid user role. Please contact support.");
          console.error("Unknown user role:", userRole);
          setIsLoading(false);
        }
      } else {
        // User document doesn't exist in Users collection
        toast.error("User data not found. Please contact support.");
        console.error("No user document found for email:", email);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.log("An error occured:", error);
      if (error.message === "Firebase: Error (auth/invalid-credential).") {
        toast.error("Invalid email or Password", {
          position: "top-right",
        });
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="font-inter text-xl font-semibold ">Welcome Back</h2>
        <p className="font-inter text-foreground">Login to your account</p>
        <form onSubmit={handleSubmit} action="submit">
          <div className="mb-1">
            <label
              htmlFor="email"
              className="invisible mb-2 text-sm font-medium text-white"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                required
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-1">
            <label
              htmlFor="password"
              className="invisible mb-2 text-sm font-medium text-white"
            >
              Password
            </label>
            <div className="relative z-0 w-full group">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <img
                  className="w-5 h-5"
                  src="/icons/password.png"
                  alt="password"
                />
              </div>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                required
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
              <div
                className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer pr-2"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <Eye size={20} className="text-gray-400" />
                ) : (
                  <EyeOff size={20} className="text-gray-400" />
                )}
              </div>
            </div>
          </div>
          <Link
            className="my-4 text-sm hover:underline float-right"
            to="/forgot-password"
          >
            Forgot Password
          </Link>
          <button
            disabled={isLoading}
            type="submit"
            className="bg-foreground/50 cursor-pointer text-white bg-muted-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center"
          >
            {isLoading ? "Loading..." : "Sign in"}
          </button>
        </form>
        <div>
          <p className="text-foreground text-center my-4 text-wrap space-x-3">
            Don't have an account?
            <Link className="text-black font-semibold" to="/sign-up">
              {" "}
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
