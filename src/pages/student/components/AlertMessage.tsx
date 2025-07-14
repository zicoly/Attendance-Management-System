import { CheckCircle, AlertCircle } from "lucide-react";

export default function AlertMessage({ message, type }: any) {
  if (!message) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-xl border-l-4 flex items-center transform transition-all duration-300 animate-pulse ${
        type === "success"
          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-emerald-100"
          : "bg-red-50 border-red-500 text-red-800 shadow-red-100"
      } shadow-lg`}
    >
      {type === "success" ? (
        <CheckCircle className="mr-3 h-5 w-5" />
      ) : (
        <AlertCircle className="mr-3 h-5 w-5" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
}
