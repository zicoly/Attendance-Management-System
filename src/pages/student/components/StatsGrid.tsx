import { Activity, Award, TrendingUp, GraduationCap } from "lucide-react";
import { StatCard } from "./StatCard";

export default function StatsGrid({
  activeClassesCount,
  attendedClassesCount,
  attendanceRate,
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Active Classes"
        value={activeClassesCount}
        icon={Activity}
        color="blue"
      />
      <StatCard
        title="Attended"
        value={attendedClassesCount}
        icon={Award}
        color="emerald"
      />
      <StatCard
        title="Attendance Rate"
        value={`${attendanceRate}%`}
        icon={TrendingUp}
        color="purple"
      />
      <StatCard
        title="Profile Status"
        value={"Complete"}
        icon={GraduationCap}
        color="orange"
      />
    </div>
  );
}
