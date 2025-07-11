import { X } from "lucide-react";
import { useState } from "react";

const CreateClassModal = ({ isOpen, onClose, onSubmit }: any) => {
  const [className, setClassName] = useState("");
  const [classDuration, setClassDuration] = useState(60);
  const [locationRequired, setLocationRequired] = useState(false);
  const [allowedRadius, setAllowedRadius] = useState(100);

  const handleSubmit = () => {
    if (!className.trim()) return;
    onSubmit({ className, classDuration, locationRequired, allowedRadius });
    setClassName("");
    setClassDuration(60);
    setLocationRequired(false);
    setAllowedRadius(100);
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
                min="50"
                max="500"
                value={allowedRadius}
                onChange={(e) => setAllowedRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>50m</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {allowedRadius}m
                </span>
                <span>500m</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!className.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          >
            Create Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;
