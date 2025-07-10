import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applyActionCode, getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function VerifyComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    if (!oobCode) return;

    applyActionCode(auth, oobCode)
      .then(() => {
        console.log("Email verified successfully!");
        navigate("/");
      })
      .catch((error) => {
        console.error("Verification error:", error);
        toast.error("Verification error:", error);
        // You could redirect to an error page if needed or maybe register screen
      });
  }, []);

  return null;
}
