import { UserRoundPen, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../../../../config/firebase";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { BASE_URL } from "../../../../../config/config";
import { sendEmailVerification } from "firebase/auth";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { toast } from "react-toastify";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to detect role from userId
  const detectRole = (userId: string): string => {
    const lowerUserId = userId.toLowerCase();

    if (lowerUserId.includes("/ug/")) {
      return "student";
    } else if (lowerUserId.includes("/st/")) {
      // Staff ID format: lcu/st/number (st = staff)
      return "lecturer";
    }

    // Default fallback
    return "unknown";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    // Detect role from userId
    const role = detectRole(userId);

    const payload = {
      firstName: firstName,
      lastName: lastName,
      userId: userId,
      email: email,
      phoneNumber: phoneNumber,
      department: department,
      password: password,
      role: role,
    };

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Send email verification first (doesn't require Firestore write)
      const actionCodeSettings = {
        url: `${BASE_URL}/`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(user, actionCodeSettings);
      // Wait for auth state to be ready (important!)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Now perform Firestore operations
      const batch = writeBatch(db);

      // User document
      const userDocRef = doc(db, "Users", user.uid);
      batch.set(userDocRef, {
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        userId: userId,
        phoneNumber: phoneNumber,
        department: department,
        password: password,
        role: role,
        createdAt: serverTimestamp(),
      });
      // Execute all operations as a batch
      await batch.commit();
      toast.success("Verification email sent! Please check your inbox.", {
        position: "top-right",
      });
      console.log("Payload data: ", payload);
      navigate("/verify");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="font-inter text-xl font-semibold ">Sign Up</h2>
        <p className="font-inter text-foreground">Create an account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} action="submit">
          <div className="grid md:grid-cols-2 md:gap-6">
            <div>
              <label
                htmlFor="first_name"
                className="invisible mb-2 text-sm font-medium text-white"
              >
                First name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <UserRoundPen size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="first_name"
                  className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e: any) => setFirstName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="invisible mb-2 text-sm font-medium text-white"
              >
                Last name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <UserRoundPen size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="last_name"
                  className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e: any) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="id"
              className="invisible mb-2 text-sm font-medium text-white"
            >
              Matric Number or Staff ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <img className="w-6 h-6" src="/icons/no.png" alt="number" />
              </div>
              <input
                type="text"
                id="id"
                className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Matric Number (lcu/ug/21/20340) or Staff ID (lcu/st/12345)"
                required
                value={userId}
                onChange={(e: any) => setUserId(e.target.value)}
              />
            </div>
            <small className="text-gray-500 text-xs mt-1">
              Format: Students: lcu/ug/year/number | Staff: lcu/st/number
            </small>
          </div>
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
              htmlFor="phone"
              className="invisible mb-2 text-sm font-medium text-white"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Phone size={20} className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone Number"
                required
                value={phoneNumber}
                onChange={(e: any) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-1 md:gap-6">
            <div className="mb-1">
              <label
                htmlFor="department"
                className="invisible mb-2 text-sm font-medium text-white"
              >
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <img
                    className="w-4 h-4"
                    src="/icons/department.png"
                    alt="icon"
                  />
                </div>
                <input
                  type="text"
                  id="department"
                  className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Department"
                  required
                  value={department}
                  onChange={(e: any) => setDepartment(e.target.value)}
                />
              </div>
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
                placeholder="Create Password"
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
          <div className="mb-6">
            <label
              htmlFor="confirm_password"
              className="invisible mb-2 text-sm font-medium text-white"
            >
              Confirm Password
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
                name="confirm_password"
                id="confirm_password"
                className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
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
          <button
            disabled={isLoading}
            type="submit"
            className="bg-foreground/50 cursor-pointer text-white bg-muted-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center"
          >
            {isLoading ? "Loading..." : "Sign up"}
          </button>
        </form>
        <div>
          <p className="text-foreground text-center my-4 text-wrap space-x-3">
            Already have an account?
            <Link className="text-black font-semibold" to="/">
              {" "}
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
