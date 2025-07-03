import { Users, MapPin, Clock } from "lucide-react";

export default function StatsCard({ activeClasses }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Classes</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeClasses.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeClasses.reduce(
                (acc: any, cls: any) => acc + cls.studentCount,
                0
              )}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Classes Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeClasses.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
