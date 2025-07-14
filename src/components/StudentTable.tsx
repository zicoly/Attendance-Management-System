// src/components/StudentTable.tsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import dayjs from "dayjs";

type Student = {
  fullName: string;
  studentID: string;
  email: string;
  department: string;
  level: string;
  course: string;
  date: string; // attendanceTime
};

type DateFilter = "all" | "week" | "month";

export const StudentTable: React.FC = () => {
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  useEffect(() => {
    const fetchData = async () => {
      const classesSnap = await getDocs(collection(db, "classes"));
      const allStudents: Student[] = [];

      classesSnap.forEach((clsDoc) => {
        const classData = clsDoc.data();
        const { title, attendees = [] } = classData;

        attendees.forEach((student: any) => {
          allStudents.push({
            fullName: `${student.lastName} ${student.firstName}`,
            studentID: student.studentId,
            email: student.email,
            department: student.department,
            level: student.level,
            course: title,
            date: student.attendanceTime,
          });
        });
      });

      setStudentsData(allStudents);
    };

    fetchData();
  }, []);

  const filterByDate = (students: Student[]) => {
    const now = dayjs();
    return students.filter((s) => {
      const attended = dayjs(s.date);
      if (dateFilter === "week") return now.diff(attended, "week") === 0;
      if (dateFilter === "month") return now.diff(attended, "month") === 0;
      return true;
    });
  };

  const searchFilter = (students: Student[]) => {
    return students.filter((student) => {
      const fullText = Object.values(student).join(" ").toLowerCase();
      return fullText.includes(search.toLowerCase());
    });
  };

  const groupByLevelAndCourse = () => {
    const grouped: Record<string, Student[]> = {};
    const filtered = searchFilter(filterByDate(studentsData));

    filtered.forEach((student) => {
      const key = `${student.level}_${student.course}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(student);
    });

    return grouped;
  };

  const downloadCSV = (students: Student[], title: string) => {
    const headers = [
      "Full Name",
      "Matric Number",
      "Email",
      "Department",
      "Level",
      "Course",
      "Date",
    ];

    const rows = students.map((s) => [
      s.fullName,
      s.studentID,
      s.email,
      s.department,
      s.level,
      s.course,
      dayjs(s.date).format("YYYY-MM-DD HH:mm"),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupedData = groupByLevelAndCourse();

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
        Student Attendance History
      </h2>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search anything..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-purple-200 bg-white p-2 rounded-md w-full md:w-1/3 shadow-sm"
        />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="border border-purple-200 bg-white p-2 rounded-md w-full md:w-1/4 shadow-sm"
        >
          <option value="all">All Dates</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {Object.entries(groupedData).map(([groupKey, students]) => {
        const [level, course] = groupKey.split("_");
        const title = `Level ${level} - ${course}`;

        return (
          <div key={groupKey} className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                {title}
              </h3>
              <button
                onClick={() => downloadCSV(students, title)}
                className="text-sm px-4 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
              <table className="w-full table-auto text-sm">
                <thead className="bg-indigo-100 text-left text-gray-700">
                  <tr>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Matric No</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={idx} className="border-t hover:bg-purple-50">
                      <td className="p-3">{student.fullName}</td>
                      <td className="p-3">{student.studentID}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.department}</td>
                      <td className="p-3">{student.level}</td>
                      <td className="p-3">{student.course}</td>
                      <td className="p-3">
                        {dayjs(student.date).format("DD MMM, YYYY HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
