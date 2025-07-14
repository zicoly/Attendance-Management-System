import { CheckCircle, Award } from "lucide-react";

export default function AttendedClasses({ classes }: any) {
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold ml-4 text-gray-800">
          Attended Classes ({classes.length})
        </h2>
      </div>

      <div className="space-y-4">
        {classes.map((cls: any, index: any) => (
          <div
            key={index}
            className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {cls.classTitle}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{cls.classCode}</p>
                <div className="flex items-center text-sm text-emerald-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Attended: {new Date(cls.markedAt).toLocaleString()}
                </div>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No attended classes yet</p>
          <p className="text-gray-400 text-sm">
            Start marking attendance to see your history
          </p>
        </div>
      )}
    </div>
  );
}
