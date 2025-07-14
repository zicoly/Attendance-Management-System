import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../../config/firebase";
import useUserData from "../../../../hooks/useUserData";
import { useUserStore } from "../../../../store/userStore";

const CreateClassModal = ({ isOpen, onClose, onSubmit }: any) => {
  useUserData();
  const { firstName, lastName } = useUserStore();

  const [className, setClassName] = useState("");
  const [classDuration, setClassDuration] = useState(60);
  const [locationRequired, setLocationRequired] = useState(false);
  const [allowedRadius, setAllowedRadius] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Generate a unique 6-character class code
  const generateClassCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async () => {
    if (!className.trim() || !user) return;

    setIsLoading(true);

    try {
      const classCode = generateClassCode();
      let geofenceData = null;

      // If location is required, get current location
      if (locationRequired) {
        try {
          // Get current position
          const position: any = await getCurrentPosition();
          const { latitude, longitude } = position.coords;

          // Optionally get address from coordinates (reverse geocoding)
          const address = await getAddressFromCoordinates(latitude, longitude);

          geofenceData = {
            enabled: true,
            radius: allowedRadius,
            latitude: latitude,
            longitude: longitude,
            address: address || null,
          };
        } catch (locationError) {
          console.error("Error getting location:", locationError);
          alert(
            "Failed to get location. Please enable location services and try again."
          );
          setIsLoading(false);
          return;
        }
      }

      const classData = {
        title: className.trim(),
        code: classCode,
        duration: classDuration,
        locationRequired,
        allowedRadius: locationRequired ? allowedRadius : null,
        lecturerId: user.uid,
        lecturerEmail: user.email,
        lecturerName: firstName,
        lecturerlastName: lastName,
        createdAt: serverTimestamp(),
        isActive: true,
        attendees: [],
        geofence: geofenceData,
      };

      // Add to Firebase collection
      const docRef = await addDoc(collection(db, "classes"), classData);

      // Call the parent component's onSubmit with the new class data
      onSubmit({
        id: docRef.id,
        ...classData,
        createdAt: new Date(), // Convert for local state
      });

      // Reset form
      setClassName("");
      setClassDuration(60);
      setLocationRequired(false);
      setAllowedRadius(100);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get current position
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // Helper function to get address from coordinates (optional)
  const getAddressFromCoordinates = async (latitude: any, longitude: any) => {
    try {
      // Using a reverse geocoding service (example with OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        return data.display_name || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Create New Class</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Class Name
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              placeholder="Enter class name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Duration (minutes)
            </label>
            <input
              type="range"
              min="15"
              max="180"
              value={classDuration}
              onChange={(e) => setClassDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>15 min</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {classDuration} minutes
              </span>
              <span>180 min</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={locationRequired}
                onChange={(e) => setLocationRequired(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="text-sm font-semibold text-gray-700">
                Enable Location Tracking
              </span>
            </label>
          </div>

          {locationRequired && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Allowed Radius (meters)
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={allowedRadius}
                onChange={(e) => setAllowedRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1m</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {allowedRadius}m
                </span>
                <span>500m</span>
              </div>

              {/* Quick radius selection buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAllowedRadius(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    allowedRadius === 1
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={isLoading}
                >
                  1m
                </button>
                <button
                  type="button"
                  onClick={() => setAllowedRadius(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    allowedRadius === 2
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={isLoading}
                >
                  2m
                </button>
                <button
                  type="button"
                  onClick={() => setAllowedRadius(5)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    allowedRadius === 5
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={isLoading}
                >
                  5m
                </button>
                <button
                  type="button"
                  onClick={() => setAllowedRadius(10)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    allowedRadius === 10
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={isLoading}
                >
                  10m
                </button>
                <button
                  type="button"
                  onClick={() => setAllowedRadius(50)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    allowedRadius === 50
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  disabled={isLoading}
                >
                  50m
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!className.trim() || isLoading || !user}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          >
            {isLoading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;
