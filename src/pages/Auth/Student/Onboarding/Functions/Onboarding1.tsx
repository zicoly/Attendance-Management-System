import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding1() {
  const [isLoading, setIsLoading] = useState<boolean>();
  const navigate = useNavigate();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    console.log();
    setIsLoading(false);
    navigate("/onboarding/2");
  };
  return (
    <div>
      <div>
        <h2 className="font-inter text-xl font-semibold ">
          Input Course Codes(s)
        </h2>
        <p className="font-inter text-foreground">
          Kindly enter the number of courses you are taking
        </p>
        <form className="mt-2" onSubmit={handleSubmit} action="submit">
          <div>
            <label
              htmlFor="id"
              className="invisible mb-2 text-sm font-medium text-white"
            >
              Number of Courses
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <img className="w-6 h-6" src="/icons/no.png" alt="number" />
              </div>
              <input
                type="number"
                id="numberofCourses"
                className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder=" Number of Course(s)"
                required
              />
            </div>
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className="mt-10 bg-foreground/50 cursor-pointer text-white bg-muted-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center"
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
