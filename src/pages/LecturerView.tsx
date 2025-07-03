//@ts-nocheck
import { BookOpen, MapPin, Users } from "lucide-react";

// const LecturerView = () => (

export default function LecturerView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <BookOpen className="mr-2 text-blue-600" />
          Create New Class
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Class Code"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geofence Radius: {radius} meters
          </label>
          <input
            type="range"
            min="10"
            max="500"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {currentLocation && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <MapPin className="inline w-4 h-4 mr-1" />
              Current Location: {currentLocation.lat.toFixed(6)},{" "}
              {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        <button
          onClick={createClass}
          disabled={!className || !classCode || !currentLocation}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Create Class
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Users className="mr-2 text-green-600" />
          My Classes
        </h3>

        {classes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No classes created yet
          </p>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{cls.name}</h4>
                    <p className="text-gray-600">Code: {cls.code}</p>
                    <p className="text-sm text-gray-500">
                      Radius: {cls.radius}m | Attendees: {cls.attendees.length}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleClassStatus(cls.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      cls.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cls.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Location: {cls.lecturerLocation.lat.toFixed(4)},{" "}
                    {cls.lecturerLocation.lng.toFixed(4)}
                  </p>
                  <p>Created: {cls.createdAt.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
