import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle, Mail } from "lucide-react";
import { auth } from "../../../config/firebase";

export default function VerifyEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23a855f7%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M0%200h20v20H0V0zm20%2020h20v20H20V20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      </div>
      <div className="w-full  flex items-center justify-center p-6">
        <div className="border-gray-700/50 border bg-gray-900/80 backdrop-blur-xl z-10 rounded-2xl shadow-lg p-8 max-w-md  w-full">
          <div className="flex justify-center  mb-6">
            <div className="p-4 rounded-full">
              <Mail className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-center text-3xl font-bold mb-3 text-white">
            Verify your Email
          </h1>

          <p className="text-center text-white text-sm mb-6">
            We've sent a verification email, Please check your inbox to verify
            your account.
          </p>

          <div className="bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Make sure to check your spam folder if you don't see the email
                in your inbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
