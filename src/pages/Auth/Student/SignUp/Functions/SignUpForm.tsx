import { UserRoundPen, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      password: password,
      confirmPassword: confirmPassword,
    };
    setIsLoading(false);
    console.log("Payload: ", payload);
    navigate("/onboarding/1");
  };
  return (
    <div>
      <div>
        <h2 className="font-inter text-xl font-semibold ">Sign Up</h2>
        <p className="font-inter text-foreground">
          Create an account - <strong>Student</strong> Sign up{" "}
        </p>
        <form onSubmit={handleSubmit} action="submit">
          <div className="grid md:grid-cols-3 md:gap-6">
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
                <select
                  className="block w-full p-3  text-sm text-gray-500 border border-gray-300 rounded-lg"
                  name=""
                  id=""
                >
                  <option value="">Gender</option>
                  <option value="">Male</option>
                  <option value="">Female</option>
                </select>
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
                placeholder=" Matric Number or Staff ID"
                required
              />
            </div>
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
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 md:gap-6">
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
                />
              </div>
            </div>
            <div className="mb-1">
              <label
                htmlFor="level"
                className="invisible mb-2 text-sm font-medium text-white"
              >
                Level
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <img className="w-4 h-4" src="/icons/level.png" alt="icon" />
                </div>
                <input
                  type="number"
                  id="level"
                  className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Level"
                  required
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
            or sign up as
            <Link className="text-black font-semibold" to="/login-lecturer">
              {" "}
              Lecturer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
