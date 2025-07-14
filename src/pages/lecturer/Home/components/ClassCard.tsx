import { useState, useEffect } from "react";
import { Check, Copy, Clock, Users, Download, Award, User } from "lucide-react";

const ClassCard = ({
  cls,
  onEndClass,
  onDownload,
  // onViewGeofence, // i will uncomment this when i start working with the geofence
  onCopyCode,
  isCodeCopied,
  copiedCode,
}: any) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Calculate remaining time
    const calculateRemainingTime = () => {
      if (!cls.createdAt || !cls.duration) return 0;

      const endTime = new Date(cls.createdAt.getTime() + cls.duration * 60000);
      const now = new Date();
      const remaining = Math.max(0, endTime.getTime() - now.getTime());

      return Math.floor(remaining / 1000); // Return in seconds
    };

    // Initial calculation
    const initialTime = calculateRemainingTime();
    setRemainingTime(initialTime);
    setIsExpired(initialTime === 0);

    // Set up interval to update every second
    const interval = setInterval(() => {
      const newTime = calculateRemainingTime();
      setRemainingTime(newTime);

      if (newTime === 0 && !isExpired) {
        setIsExpired(true);
        // Optionally auto-end the class when timer expires
        // onEndClass(cls.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cls.createdAt, cls.duration, cls.id, isExpired]);

  // Format time in MM:SS format
  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (isExpired) return "text-red-600";
    if (remainingTime < 300) return "text-orange-500"; // Less than 5 minutes
    if (remainingTime < 900) return "text-yellow-500"; // Less than 15 minutes
    return "text-green-600";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {cls.title}
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                <span className="font-medium text-gray-700">Code:</span>
                <span className="font-mono bg-indigo-100 px-2 py-1 rounded text-indigo-700 font-bold">
                  {cls.code}
                </span>
                <button
                  onClick={() => onCopyCode(cls.code)}
                  className="ml-1 p-1 hover:bg-indigo-100 rounded transition-colors"
                >
                  {isCodeCopied && copiedCode === cls.code ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{cls.duration} min</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className={`font-bold ${getTimerColor()}`}>
                  {isExpired ? "EXPIRED" : formatTime(remainingTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-blue-600">
                  {cls.attendees?.length || 0} students
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* {cls.locationRequired && (
              <button
                onClick={() => onViewGeofence(cls)}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Target className="w-4 h-4" />
                Geofence
              </button>
            )} */}
            <button
              onClick={() => onDownload(cls)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => onEndClass(cls.id)}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              End Class
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {cls.locationRequired && cls.geofence && (
          <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-1">
              Location Details:
            </p>
            <p className="text-sm text-blue-600 mb-1">
              Lead City University; Lat: {cls.geofence.latitude}, Lon:{" "}
              {cls.geofence.longitude}
            </p>
            <p className="text-sm text-blue-600">
              Allowed Radius: {cls.geofence.radius || cls.allowedRadius}m
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-full">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h5 className="text-lg font-bold text-gray-900">Recent Attendance</h5>
        </div>

        {cls.attendees && cls.attendees.length > 0 ? (
          <div className="space-y-3">
            {cls.attendees.slice(0, 3).map((attendee: any, index: any) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {attendee.lastName} {attendee.firstName}
                        <br />
                        {attendee.department}
                        <br />
                        <p className="text-sm text-gray-600">
                          {attendee.email}
                        </p>
                        <p className="text-sm text-gray-600">400 level</p>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">
                      {attendee.studentId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {cls.attendees.length > 3 && (
              <p className="text-center text-gray-500 text-sm">
                +{cls.attendees.length - 3} more students
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No students have signed attendance yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
