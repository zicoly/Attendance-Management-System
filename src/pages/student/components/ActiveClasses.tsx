import { BookOpen } from "lucide-react";
import ClassCard from "./ClassCard";

export default function ActiveClasses({
  classes,
  onMarkAttendance,
  attendedClasses = [],
  studentInfo = {},
}: any) {
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-full">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold ml-4 text-gray-800">
          Active Classes ({classes.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls: any) => (
          <ClassCard
            key={cls.id}
            classData={cls}
            onMarkAttendance={onMarkAttendance}
            attendedClasses={attendedClasses}
            studentInfo={studentInfo}
          />
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No active classes at the moment
          </p>
          <p className="text-gray-400 text-sm">
            Check back later for new classes
          </p>
        </div>
      )}
    </div>
  );
}
